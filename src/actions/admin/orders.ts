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

  await prisma.order.update({ where: { id }, data: { status } });
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
