"use server";

import { effectivePrice } from "@/lib/format";
import prisma from "@/lib/prisma";
import type { CartItemInput } from "@/lib/validators/order";

export type CartLineDetails = {
  variantId: number;
  productId: number;
  name: string;
  slug: string;
  size: string;
  color: string;
  image: string | null;
  unitPrice: number;
  stock: number;
  available: boolean;
  qty: number;
};

/** Live price and stock for the cart lines currently in the browser. */
export async function getCartDetails(
  items: CartItemInput[],
): Promise<CartLineDetails[]> {
  const variantIds = [...new Set(items.map((item) => item.variantId))];
  if (variantIds.length === 0) return [];

  const variants = await prisma.productVariant.findMany({
    where: { id: { in: variantIds } },
    include: {
      product: { include: { images: { orderBy: { sortOrder: "asc" } } } },
    },
  });
  const byId = new Map(variants.map((variant) => [variant.id, variant]));

  return items.map((line) => {
    const variant = byId.get(line.variantId);

    if (!variant) {
      return {
        variantId: line.variantId,
        productId: 0,
        name: "Unavailable item",
        slug: "",
        size: "",
        color: "",
        image: null,
        unitPrice: 0,
        stock: 0,
        available: false,
        qty: line.qty,
      };
    }

    const image =
      variant.product.images.find((image) => image.color === variant.color)
        ?.url ??
      variant.product.images[0]?.url ??
      null;

    return {
      variantId: variant.id,
      productId: variant.productId,
      name: variant.product.name,
      slug: variant.product.slug,
      size: variant.size,
      color: variant.color,
      image,
      unitPrice: effectivePrice(
        variant.product.basePrice,
        variant.product.salePrice,
      ),
      stock: variant.stock,
      available: variant.product.isActive && variant.stock > 0,
      qty: line.qty,
    };
  });
}
