"use server";

import { revalidatePath } from "next/cache";

import prisma from "@/lib/prisma";
import { requireAdminUser } from "@/lib/session";

export type AdminActionResult = { ok: boolean; error?: string };

const ORDER_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "RETURNED",
] as const;

const ADVANCE_STATUSES = ["PENDING", "VERIFIED", "REJECTED"] as const;

type OrderStatusValue = (typeof ORDER_STATUSES)[number];
type AdvanceStatusValue = (typeof ADVANCE_STATUSES)[number];

export async function updateOrderStatus(
  id: number,
  status: OrderStatusValue,
): Promise<AdminActionResult> {
  await requireAdminUser();
  if (!ORDER_STATUSES.includes(status)) {
    return { ok: false, error: "Unknown order status." };
  }

  try {
    await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id },
        include: { orderItems: { select: { variantId: true, qty: true } } },
      });
      if (!order) throw new Error("ORDER_NOT_FOUND");
      if (order.status === "CANCELLED" && status !== "CANCELLED") {
        throw new Error("CANCELLED_ORDER");
      }

      const updated = await tx.order.updateMany({
        where: { id, status: order.status },
        data: { status },
      });
      if (updated.count !== 1) throw new Error("ORDER_CHANGED");

      if (status === "CANCELLED" && order.status !== "CANCELLED") {
        for (const item of order.orderItems) {
          if (item.variantId == null) continue;
          await tx.productVariant.updateMany({
            where: { id: item.variantId },
            data: { stock: { increment: item.qty } },
          });
        }
      }
    });
  } catch (error) {
    if (error instanceof Error && error.message === "ORDER_NOT_FOUND") {
      return { ok: false, error: "Order not found." };
    }
    if (error instanceof Error && error.message === "CANCELLED_ORDER") {
      return { ok: false, error: "A cancelled order cannot be reopened." };
    }
    if (error instanceof Error && error.message === "ORDER_CHANGED") {
      return { ok: false, error: "This order changed. Refresh and try again." };
    }
    return { ok: false, error: "Could not update the order status." };
  }
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
  revalidatePath("/account/orders");
  return { ok: true };
}

export async function updateAdvanceStatus(
  id: number,
  advanceStatus: AdvanceStatusValue,
): Promise<AdminActionResult> {
  await requireAdminUser();
  if (!ADVANCE_STATUSES.includes(advanceStatus)) {
    return { ok: false, error: "Unknown advance status." };
  }

  await prisma.order.update({ where: { id }, data: { advanceStatus } });
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
  return { ok: true };
}

export async function setBalanceCollected(
  id: number,
  value: boolean,
): Promise<AdminActionResult> {
  await requireAdminUser();
  await prisma.order.update({ where: { id }, data: { balanceCollected: value } });
  revalidatePath(`/admin/orders/${id}`);
  return { ok: true };
}

export async function saveOrderNote(
  id: number,
  note: string,
): Promise<AdminActionResult> {
  await requireAdminUser();
  await prisma.order.update({
    where: { id },
    data: { adminNote: note.trim() ? note.trim() : null },
  });
  revalidatePath(`/admin/orders/${id}`);
  return { ok: true };
}
