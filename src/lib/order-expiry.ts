import { revalidateTag } from "next/cache";

import { PRODUCT_DETAIL_TAG } from "@/lib/cache-tags";
import prisma from "@/lib/prisma";

export const ONLINE_ORDER_HOLD_HOURS = 24;

/** Cancel unverified online orders and release their reserved stock exactly once. */
export async function expireUnverifiedOnlineOrders(now = new Date()) {
  const cutoff = new Date(now.getTime() - ONLINE_ORDER_HOLD_HOURS * 60 * 60 * 1000);

  const expired = await prisma.$transaction(async (tx) => {
    const orders = await tx.order.findMany({
      where: {
        status: "PENDING",
        advanceAmount: { gt: 0 },
        advanceStatus: "PENDING",
        createdAt: { lte: cutoff },
      },
      select: {
        id: true,
        orderItems: { select: { variantId: true, qty: true } },
      },
    });

    const expiredIds: number[] = [];
    for (const order of orders) {
      const result = await tx.order.updateMany({
        where: {
          id: order.id,
          status: "PENDING",
          advanceStatus: "PENDING",
          createdAt: { lte: cutoff },
        },
        data: {
          status: "CANCELLED",
          advanceStatus: "REJECTED",
          adminNote: "Automatically cancelled after the 24-hour payment-verification window.",
        },
      });
      if (result.count !== 1) continue;

      for (const item of order.orderItems) {
        if (item.variantId == null) continue;
        await tx.productVariant.updateMany({
          where: { id: item.variantId },
          data: { stock: { increment: item.qty } },
        });
      }
      expiredIds.push(order.id);
    }
    return expiredIds;
  });

  if (expired.length > 0) revalidateTag(PRODUCT_DETAIL_TAG);
  return { expiredCount: expired.length };
}
