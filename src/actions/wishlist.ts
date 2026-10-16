"use server";

import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";

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

  await prisma.wishlist.createMany({
    data: unique.map((productId) => ({ userId: session.user.id, productId })),
    skipDuplicates: true,
  });
}
