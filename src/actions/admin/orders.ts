"use server";

import { revalidatePath, revalidateTag } from "next/cache";

import prisma from "@/lib/prisma";
import { CATALOG_TAG, PRODUCT_DETAIL_TAG } from "@/lib/cache-tags";
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
      if (
        order.advanceAmount === 0 &&
        order.status === "PENDING" &&
        status !== "CONFIRMED" &&
        status !== "CANCELLED" &&
        status !== "PENDING"
      ) {
        throw new Error("COD_NOT_CONFIRMED");
      }
      if (
        order.advanceAmount > 0 &&
        order.advanceStatus !== "VERIFIED" &&
        ["CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"].includes(status)
      ) {
        throw new Error("ADVANCE_NOT_VERIFIED");
      }

      if (
        order.advanceAmount === 0 &&
        order.status === "PENDING" &&
        status === "CONFIRMED"
      ) {
        for (const item of order.orderItems) {
          if (item.variantId == null) continue;
          const reserved = await tx.productVariant.updateMany({
            where: { id: item.variantId, stock: { gte: item.qty } },
            data: { stock: { decrement: item.qty } },
          });
          if (reserved.count !== 1) throw new Error("COD_STOCK_UNAVAILABLE");
        }
      }

      const updated = await tx.order.updateMany({
        where: { id, status: order.status },
        data: { status },
      });
      if (updated.count !== 1) throw new Error("ORDER_CHANGED");

      const manualRequestWithoutReservation =
        order.advanceAmount === 0 && order.status === "PENDING";
      if (
        status === "CANCELLED" &&
        order.status !== "CANCELLED" &&
        !manualRequestWithoutReservation
      ) {
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
    if (error instanceof Error && error.message === "ADVANCE_NOT_VERIFIED") {
      return {
        ok: false,
        error: "Verify the online payment before confirming this order.",
      };
    }
    if (error instanceof Error && error.message === "COD_NOT_CONFIRMED") {
      return {
        ok: false,
        error: "Confirm this COD request and check stock before moving it forward.",
      };
    }
    if (error instanceof Error && error.message === "COD_STOCK_UNAVAILABLE") {
      return {
        ok: false,
        error: "There is not enough stock to confirm this COD request.",
      };
    }
    if (error instanceof Error && error.message === "ORDER_CHANGED") {
      return { ok: false, error: "This order changed. Refresh and try again." };
    }
    return { ok: false, error: "Could not update the order status." };
  }
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
  revalidatePath("/account/orders");
  if (status === "CANCELLED") revalidateTag(PRODUCT_DETAIL_TAG);
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

  try {
    await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id },
        include: { orderItems: { select: { variantId: true, qty: true } } },
      });
      if (!order) throw new Error("ORDER_NOT_FOUND");
      if (order.advanceAmount === 0) throw new Error("NO_ONLINE_PAYMENT");
      if (order.advanceStatus === "VERIFIED") {
        throw new Error("PAYMENT_ALREADY_VERIFIED");
      }
      if (order.status !== "PENDING") throw new Error("ORDER_NOT_PENDING");
      const updated = await tx.order.updateMany({
        where: {
          id,
          status: "PENDING",
          advanceStatus: order.advanceStatus,
        },
        data: {
          advanceStatus,
          ...(advanceStatus === "REJECTED" ? { status: "CANCELLED" as const } : {}),
          ...(advanceStatus === "VERIFIED" && order.status === "PENDING"
            ? { status: "CONFIRMED" as const }
            : {}),
        },
      });
      if (updated.count !== 1) throw new Error("ORDER_CHANGED");
      if (advanceStatus === "REJECTED") {
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
    if (error instanceof Error && error.message === "NO_ONLINE_PAYMENT") {
      return { ok: false, error: "This COD order has no online payment to verify." };
    }
    if (error instanceof Error && error.message === "ORDER_NOT_PENDING") {
      return { ok: false, error: "This order is no longer awaiting payment verification." };
    }
    if (error instanceof Error && error.message === "PAYMENT_ALREADY_VERIFIED") {
      return { ok: false, error: "A verified payment cannot be changed here." };
    }
    if (error instanceof Error && error.message === "ORDER_CHANGED") {
      return { ok: false, error: "This order changed. Refresh and try again." };
    }
    return { ok: false, error: "Could not update the payment status." };
  }
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
  revalidatePath("/account/orders");
  if (advanceStatus === "REJECTED") revalidateTag(CATALOG_TAG);
  if (advanceStatus === "REJECTED") revalidateTag(PRODUCT_DETAIL_TAG);
  return { ok: true };
}

export async function setBalanceCollected(
  id: number,
  value: boolean,
): Promise<AdminActionResult> {
  await requireAdminUser();
  if (!Number.isInteger(id) || id <= 0 || typeof value !== "boolean") {
    return { ok: false, error: "Invalid balance update." };
  }
  const result = await prisma.order.updateMany({
    where: { id, status: "DELIVERED" },
    data: { balanceCollected: value },
  });
  if (result.count !== 1) {
    return { ok: false, error: "Balance can only be updated after delivery." };
  }
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
