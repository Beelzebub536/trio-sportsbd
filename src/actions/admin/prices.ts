"use server";

import { revalidatePath, revalidateTag } from "next/cache";

import prisma from "@/lib/prisma";
import { CATALOG_TAG, PRODUCT_DETAIL_TAG } from "@/lib/cache-tags";
import { requireAdminUser } from "@/lib/session";
import { priceBatchSchema } from "@/lib/validators/prices";

export type PriceActionResult = {
  ok: boolean;
  error?: string;
  batchId?: number;
  changed?: number;
  skipped?: number;
};

const STOREFRONT_PATHS = [
  "/",
  "/shop",
  "/sale",
  "/men",
  "/women",
  "/kids",
  "/jerseys",
  "/trousers",
  "/accessories",
];

function revalidateStorefront(): void {
  for (const path of STOREFRONT_PATHS) {
    revalidatePath(path);
  }
}

type BatchItem = {
  id: number;
  name: string;
  oldBase: number;
  newBase: number;
  oldSale: number | null;
  newSale: number | null;
};

export async function savePriceBatch(values: {
  label: string;
  edits: Array<{ id: number; basePrice: number; salePrice: number | null }>;
}): Promise<PriceActionResult> {
  const admin = await requireAdminUser();

  const parsed = priceBatchSchema.safeParse(values);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.errors[0]?.message ?? "Invalid price changes",
    };
  }
  const { label, edits } = parsed.data;

  const products = await prisma.product.findMany({
    where: { id: { in: edits.map((edit) => edit.id) } },
    select: { id: true, name: true, basePrice: true, salePrice: true },
  });
  const byId = new Map(products.map((product) => [product.id, product]));

  const changes: Array<{
    productId: number;
    field: "BASE" | "SALE";
    oldValue: number | null;
    newValue: number | null;
  }> = [];
  const items: BatchItem[] = [];

  for (const edit of edits) {
    const product = byId.get(edit.id);
    if (!product) continue;
    if (
      product.basePrice === edit.basePrice &&
      product.salePrice === edit.salePrice
    ) {
      continue;
    }

    if (product.basePrice !== edit.basePrice) {
      changes.push({
        productId: edit.id,
        field: "BASE",
        oldValue: product.basePrice,
        newValue: edit.basePrice,
      });
    }
    if (product.salePrice !== edit.salePrice) {
      changes.push({
        productId: edit.id,
        field: "SALE",
        oldValue: product.salePrice,
        newValue: edit.salePrice,
      });
    }

    items.push({
      id: edit.id,
      name: product.name,
      oldBase: product.basePrice,
      newBase: edit.basePrice,
      oldSale: product.salePrice,
      newSale: edit.salePrice,
    });
  }

  if (items.length === 0) {
    return { ok: false, error: "Nothing changed." };
  }

  try {
    const batchId = await prisma.$transaction(async (tx) => {
      const batch = await tx.priceBatch.create({
        data: {
          label,
          createdById: admin.id,
          summary: { count: items.length, items },
        },
        select: { id: true },
      });

      await tx.priceChange.createMany({
        data: changes.map((change) => ({
          batchId: batch.id,
          productId: change.productId,
          field: change.field,
          oldValue: change.oldValue,
          newValue: change.newValue,
        })),
      });

      for (const item of items) {
        await tx.product.update({
          where: { id: item.id },
          data: { basePrice: item.newBase, salePrice: item.newSale },
        });
      }

      return batch.id;
    });

    revalidateStorefront();
    revalidateTag(CATALOG_TAG);
    revalidateTag(PRODUCT_DETAIL_TAG);
    revalidatePath("/admin/prices");
    revalidatePath("/admin/prices/history");

    return { ok: true, batchId, changed: items.length };
  } catch (error) {
    console.error("savePriceBatch failed:", error);
    return { ok: false, error: "Could not save the price batch." };
  }
}

export async function undoBatch(batchId: number): Promise<PriceActionResult> {
  await requireAdminUser();

  const batch = await prisma.priceBatch.findUnique({
    where: { id: batchId },
    include: { priceChanges: true },
  });
  if (!batch) return { ok: false, error: "That batch no longer exists." };
  if (batch.revertedAt) {
    return { ok: false, error: "That batch has already been undone." };
  }

  const productIds = [...new Set(batch.priceChanges.map((c) => c.productId))];

  // A newer batch that touched the same product wins — skip those products.
  const newer = await prisma.priceChange.findMany({
    where: {
      productId: { in: productIds },
      batchId: { not: batchId },
      batch: { createdAt: { gt: batch.createdAt }, revertedAt: null },
    },
    select: { productId: true },
  });
  const skip = new Set(newer.map((change) => change.productId));

  const targets = batch.priceChanges.filter(
    (change) => !skip.has(change.productId),
  );
  if (targets.length === 0) {
    return {
      ok: false,
      error:
        "Newer price changes touched every product in this batch, so it cannot be undone.",
    };
  }

  const restore = new Map<number, { base?: number | null; sale?: number | null }>();
  for (const change of targets) {
    const entry = restore.get(change.productId) ?? {};
    if (change.field === "BASE") entry.base = change.oldValue;
    if (change.field === "SALE") entry.sale = change.oldValue;
    restore.set(change.productId, entry);
  }

  const current = await prisma.product.findMany({
    where: { id: { in: [...restore.keys()] } },
    select: { id: true, basePrice: true, salePrice: true },
  });
  const currentById = new Map(current.map((product) => [product.id, product]));

  try {
    await prisma.$transaction(async (tx) => {
      for (const [productId, entry] of restore) {
        const row = currentById.get(productId);
        if (!row) continue;

        const basePrice =
          entry.base != null && entry.base > 0 ? entry.base : row.basePrice;
        let salePrice =
          entry.sale === undefined ? row.salePrice : entry.sale;
        if (salePrice != null && (salePrice >= basePrice || salePrice <= 0)) {
          salePrice = null;
        }

        await tx.product.update({
          where: { id: productId },
          data: { basePrice, salePrice },
        });
      }

      await tx.priceBatch.update({
        where: { id: batchId },
        data: { revertedAt: new Date() },
      });
    });

    revalidateStorefront();
    revalidateTag(CATALOG_TAG);
    revalidateTag(PRODUCT_DETAIL_TAG);
    revalidatePath("/admin/prices");
    revalidatePath("/admin/prices/history");

    return { ok: true, skipped: skip.size, changed: restore.size };
  } catch (error) {
    console.error("undoBatch failed:", error);
    return { ok: false, error: "Could not undo the batch." };
  }
}
