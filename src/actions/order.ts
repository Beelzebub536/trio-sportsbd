"use server";

import { revalidatePath, revalidateTag } from "next/cache";

import { effectivePrice } from "@/lib/format";
import { PRODUCT_DETAIL_TAG } from "@/lib/cache-tags";
import { signOrderToken } from "@/lib/order-token";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { getSettings } from "@/lib/settings";
import { checkoutSchema, type CheckoutValues } from "@/lib/validators/order";

export type PlaceOrderResult =
  | { ok: true; orderNumber: string; token: string }
  | { ok: false; error: string };

const randomDigits = (): number => Math.floor(1000 + Math.random() * 9000);

const makeOrderNumber = (): string => {
  const now = new Date();
  const year = String(now.getFullYear()).slice(2);
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `TS-${year}${month}${day}-${randomDigits()}`;
};

const RATE_LIMIT_PER_HOUR = 5;

export async function placeOrder(
  input: CheckoutValues,
): Promise<PlaceOrderResult> {
  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.errors[0]?.message ?? "Please check the form.",
    };
  }
  const values = parsed.data;

  const [settings, session] = await Promise.all([getSettings(), getSession()]);

  // Simple DB-based rate limit: max 5 orders per phone number per hour.
  const recent = await prisma.order.count({
    where: {
      phone: values.phone,
      createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) },
    },
  });
  if (recent >= RATE_LIMIT_PER_HOUR) {
    return {
      ok: false,
      error:
        "Too many orders from this number recently. Please message us on WhatsApp.",
    };
  }

  const variantIds = [...new Set(values.items.map((item) => item.variantId))];
  const variants = await prisma.productVariant.findMany({
    where: { id: { in: variantIds } },
    include: {
      product: { include: { images: { orderBy: { sortOrder: "asc" } } } },
    },
  });
  const byId = new Map(variants.map((variant) => [variant.id, variant]));

  type Line = {
    variantId: number;
    productId: number;
    name: string;
    size: string;
    color: string;
    image: string | null;
    unitPrice: number;
    qty: number;
  };

  const lines: Line[] = [];
  for (const item of values.items) {
    const variant = byId.get(item.variantId);
    if (!variant || !variant.product.isActive) {
      return {
        ok: false,
        error: "One of the items is no longer available. Please review your bag.",
      };
    }
    if (variant.stock < item.qty) {
      return {
        ok: false,
        error: `Only ${variant.stock} left of ${variant.product.name} (${variant.size}).`,
      };
    }

    lines.push({
      variantId: variant.id,
      productId: variant.productId,
      name: variant.product.name,
      size: variant.size,
      color: variant.color,
      image:
        variant.product.images.find((image) => image.color === variant.color)
          ?.url ??
        variant.product.images[0]?.url ??
        null,
      unitPrice: effectivePrice(
        variant.product.basePrice,
        variant.product.salePrice,
      ),
      qty: item.qty,
    });
  }

  const subtotal = lines.reduce(
    (sum, line) => sum + line.unitPrice * line.qty,
    0,
  );
  const insideDhaka = values.division === "Dhaka";
  let shippingFee = insideDhaka
    ? settings.shippingInsideDhaka
    : settings.shippingOutsideDhaka;
  if (subtotal >= settings.freeShippingThreshold) shippingFee = 0;

  const total = subtotal + shippingFee;
  const advanceAmount = Math.ceil((total * settings.advancePercent) / 100);

  try {
    const created = await prisma.$transaction(async (tx) => {
      for (const line of lines) {
        const result = await tx.productVariant.updateMany({
          where: { id: line.variantId, stock: { gte: line.qty } },
          data: { stock: { decrement: line.qty } },
        });
        if (result.count === 0) {
          throw new Error(`STOCK:${line.name}`);
        }
      }

      let orderNumber = makeOrderNumber();
      let attempts = 0;
      while (attempts < 5) {
        const exists = await tx.order.findUnique({
          where: { orderNumber },
          select: { id: true },
        });
        if (!exists) break;
        orderNumber = makeOrderNumber();
        attempts += 1;
      }

      return tx.order.create({
        data: {
          orderNumber,
          userId: session?.user?.id ?? null,
          customerName: values.fullName,
          phone: values.phone,
          division: values.division,
          district: values.district,
          upazila: values.upazila,
          address: values.address,
          note: values.note ? values.note : null,
          subtotal,
          shippingFee,
          total,
          advanceAmount,
          advanceMethod: values.advanceMethod,
          advanceTrxId: values.advanceTrxId,
          advanceSenderNumber: values.advanceSenderNumber,
          orderItems: {
            create: lines.map((line) => ({
              variantId: line.variantId,
              productId: line.productId,
              name: line.name,
              size: line.size,
              color: line.color,
              image: line.image,
              unitPrice: line.unitPrice,
              qty: line.qty,
            })),
          },
        },
        select: { orderNumber: true },
      });
    });

    revalidatePath("/admin");
    revalidatePath("/admin/orders");
    revalidateTag(PRODUCT_DETAIL_TAG);

    return {
      ok: true,
      orderNumber: created.orderNumber,
      token: signOrderToken(created.orderNumber),
    };
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("STOCK:")) {
      return {
        ok: false,
        error:
          "Sorry, one of your items sold out while you were checking out. Please review your bag.",
      };
    }
    console.error("placeOrder failed:", error);
    return {
      ok: false,
      error:
        "We could not place your order. Please try again, or message us on WhatsApp.",
    };
  }
}
