"use server";

import { revalidatePath, revalidateTag } from "next/cache";

import prisma from "@/lib/prisma";
import { CATALOG_TAG, PRODUCT_DETAIL_TAG } from "@/lib/cache-tags";
import { requireAdminUser } from "@/lib/session";
import { productSchema, type ProductValues } from "@/lib/validators/product";

export type AdminActionResult = { ok: boolean; error?: string; id?: number };

const slugify = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export async function saveProduct(
  values: ProductValues,
  id?: number,
): Promise<AdminActionResult> {
  await requireAdminUser();

  const parsed = productSchema.safeParse(values);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.errors[0]?.message ?? "Invalid product data",
    };
  }
  const data = parsed.data;

  const clash = await prisma.product.findFirst({
    where: { slug: data.slug, ...(id ? { id: { not: id } } : {}) },
    select: { id: true },
  });
  if (clash) {
    return { ok: false, error: "That slug is already used by another product." };
  }

  const skus = data.variants.map(
    (variant) =>
      variant.sku?.trim() ||
      `${data.slug}-${slugify(variant.color)}-${slugify(variant.size)}`.toUpperCase(),
  );
  if (new Set(skus).size !== skus.length) {
    return { ok: false, error: "Each size/colour combination must be unique." };
  }

  try {
    const productId = await prisma.$transaction(async (tx) => {
      let targetId = id;

      if (targetId) {
        await tx.product.update({
          where: { id: targetId },
          data: {
            name: data.name,
            slug: data.slug,
            description: data.description,
            brand: data.brand?.trim() ? data.brand.trim() : null,
            gender: data.gender,
            categoryId: data.categoryId,
            basePrice: data.basePrice,
            salePrice: data.salePrice,
            isActive: data.isActive,
            isFeatured: data.isFeatured,
          },
        });
        await tx.productImage.deleteMany({ where: { productId: targetId } });
        await tx.productVariant.deleteMany({ where: { productId: targetId } });
      } else {
        const created = await tx.product.create({
          data: {
            name: data.name,
            slug: data.slug,
            description: data.description,
            brand: data.brand?.trim() ? data.brand.trim() : null,
            gender: data.gender,
            categoryId: data.categoryId,
            basePrice: data.basePrice,
            salePrice: data.salePrice,
            isActive: data.isActive,
            isFeatured: data.isFeatured,
          },
          select: { id: true },
        });
        targetId = created.id;
      }

      const productIdValue = targetId as number;

      if (data.images.length > 0) {
        await tx.productImage.createMany({
          data: data.images.map((image, index) => ({
            productId: productIdValue,
            url: image.url,
            publicId: image.publicId?.trim() || image.url,
            color: image.color?.trim() ? image.color.trim() : null,
            sortOrder: image.sortOrder ?? index,
          })),
        });
      }

      await tx.productVariant.createMany({
        data: data.variants.map((variant, index) => ({
          productId: productIdValue,
          size: variant.size,
          color: variant.color,
          colorHex: variant.colorHex?.trim() || null,
          stock: variant.stock,
          sku: skus[index],
        })),
      });

      return productIdValue;
    });

    revalidatePath("/admin/products");
    revalidatePath("/shop");
    revalidatePath("/");
    revalidatePath(`/product/${data.slug}`);
    revalidateTag(CATALOG_TAG);
    revalidateTag(PRODUCT_DETAIL_TAG);

    return { ok: true, id: productId };
  } catch (error) {
    console.error("saveProduct failed:", error);
    return {
      ok: false,
      error: "Could not save the product. Check the SKUs are unique.",
    };
  }
}

export async function toggleProductActive(
  id: number,
  isActive: boolean,
): Promise<AdminActionResult> {
  await requireAdminUser();
  await prisma.product.update({ where: { id }, data: { isActive } });
  revalidateTag(CATALOG_TAG);
  revalidateTag(PRODUCT_DETAIL_TAG);
  revalidatePath("/admin/products");
  revalidatePath("/shop");
  return { ok: true };
}

export async function deleteProduct(id: number): Promise<AdminActionResult> {
  await requireAdminUser();

  try {
    await prisma.$transaction([
      prisma.wishlist.deleteMany({ where: { productId: id } }),
      prisma.priceChange.deleteMany({ where: { productId: id } }),
      prisma.productImage.deleteMany({ where: { productId: id } }),
      prisma.productVariant.deleteMany({ where: { productId: id } }),
      prisma.product.delete({ where: { id } }),
    ]);
    revalidateTag(CATALOG_TAG);
    revalidateTag(PRODUCT_DETAIL_TAG);
    revalidatePath("/admin/products");
    revalidatePath("/shop");
    return { ok: true };
  } catch (error) {
    console.error("deleteProduct failed:", error);
    return { ok: false, error: "Could not delete the product." };
  }
}
