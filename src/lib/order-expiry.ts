import { revalidateTag } from "next/cache";

import { CATALOG_TAG, PRODUCT_DETAIL_TAG } from "@/lib/cache-tags";
import prisma from "@/lib/prisma";

export const ONLINE_ORDER_HOLD_HOURS = 24;

/** Cancel stale requests and release online reservations exactly once. */
export async function expireStalePendingOrders(now = new Date()) {
  const cutoff = new Date(now.getTime() - ONLINE_ORDER_HOLD_HOURS * 60 * 60 * 1000);

  const expired = await prisma.$transaction(async (tx) => {
    const orders = await tx.order.findMany({
      where: {
        status: "PENDING",
        OR: [
          { advanceAmount: 0, createdAt: { lte: cutoff } },
          {
            advanceAmount: { gt: 0 },
            advanceStatus: "PENDING",
            createdAt: { lte: cutoff },
          },
          { advanceAmount: { gt: 0 }, advanceStatus: "REJECTED" },
        ],
      },
      select: {
        id: true,
        advanceAmount: true,
        advanceStatus: true,
        orderItems: { select: { variantId: true, qty: true } },
      },
    });

    const expiredIds: number[] = [];
    for (const order of orders) {
      const result = await tx.order.updateMany({
        where: {
          id: order.id,
          status: "PENDING",
          ...(order.advanceAmount > 0
            ? {
                advanceStatus: order.advanceStatus,
                ...(order.advanceStatus === "REJECTED"
                  ? {}
                  : { createdAt: { lte: cutoff } }),
              }
            : { advanceAmount: 0, createdAt: { lte: cutoff } }),
        },
        data: {
          status: "CANCELLED",
          ...(order.advanceAmount > 0 ? { advanceStatus: "REJECTED" as const } : {}),
          adminNote: order.advanceAmount > 0
            ? "Automatically cancelled after the 24-hour payment-verification window."
            : "Automatically cancelled after the 24-hour order-request window.",
        },
      });
      if (result.count !== 1) continue;

      if (order.advanceAmount > 0) {
        for (const item of order.orderItems) {
          if (item.variantId == null) continue;
          await tx.productVariant.updateMany({
            where: { id: item.variantId },
            data: { stock: { increment: item.qty } },
          });
        }
      }
      expiredIds.push(order.id);
    }
    return expiredIds;
  });

  if (expired.length > 0) {
    revalidateTag(PRODUCT_DETAIL_TAG, { expire: 0 });
    revalidateTag(CATALOG_TAG, { expire: 0 });
  }
  return { expiredCount: expired.length };
}
