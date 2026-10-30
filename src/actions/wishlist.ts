"use server";

import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { getProductsByIds } from "@/lib/queries/products";
import { z } from "zod";

const guestWishlistIds = z.array(z.number().int().positive()).max(200);

/** Resolve the guest's local wishlist to current, active product cards. */
export async function getGuestWishlistProductsAction(input: number[]) {
  const parsed = guestWishlistIds.safeParse(input);
  if (!parsed.success) return [];
  const ids = [...new Set(parsed.data)];
  const products = await getProductsByIds(ids);
  const byId = new Map(products.map((product) => [product.id, product]));
  return ids.flatMap((id) => {
    const product = byId.get(id);
    return product ? [product] : [];
  });
}

/** Toggle a product in the signed-in user's wishlist. */
export async function toggleWishlistAction(
  productId: number,
): Promise<{ saved: boolean }> {
  const session = await getSession();
  if (!session?.user) throw new Error("Not signed in");

  const existing = await prisma.wishlist.findUnique({
    where: { userId_productId: { userId: session.user.id, productId } },
  });

  if (existing) {
    await prisma.wishlist.delete({ where: { id: existing.id } });
    return { saved: false };
  }

  await prisma.wishlist.create({
    data: { userId: session.user.id, productId },
  });
  return { saved: true };
}

/** Merge a guest's local wishlist into the DB (called once after login). */
export async function mergeWishlistAction(productIds: number[]): Promise<void> {
  const session = await getSession();
  if (!session?.user) return;

  const unique = [...new Set(productIds)].filter(Number.isInteger).slice(0, 200);
  if (unique.length === 0) return;

  // A deleted product left in localStorage would fail the whole insert on its foreign key.
  const existing = await prisma.product.findMany({
    where: { id: { in: unique } },
    select: { id: true },
  });

  await prisma.wishlist.createMany({
    data: existing.map(({ id }) => ({ userId: session.user.id, productId: id })),
    skipDuplicates: true,
  });
}
