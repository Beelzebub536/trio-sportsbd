import prisma from "@/lib/prisma";

export async function getWishlistProductIds(userId: string): Promise<number[]> {
  const rows = await prisma.wishlist.findMany({
    where: { userId },
    select: { productId: true },
  });
  return rows.map((row) => row.productId);
}
