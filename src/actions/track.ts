"use server";

import prisma from "@/lib/prisma";

export type TrackedOrder = {
  orderNumber: string;
  customerName: string;
  status: string;
  advanceStatus: string;
  total: number;
  advanceAmount: number;
  createdAt: string;
  items: Array<{ name: string; size: string; color: string; qty: number }>;
};

/** Guests track an order with the order number plus the phone used to order. */
export async function trackOrder(
  orderNumber: string,
  phone: string,
): Promise<TrackedOrder | null> {
  const number = orderNumber.trim().toUpperCase();
  const cleanPhone = phone.trim().replace(/\s+/g, "");

  if (!number || !cleanPhone) return null;

  const order = await prisma.order.findFirst({
    where: { orderNumber: number, phone: cleanPhone },
    include: { orderItems: true },
  });

  if (!order) return null;

  return {
    orderNumber: order.orderNumber,
    customerName: order.customerName,
    status: order.status,
    advanceStatus: order.advanceStatus,
    total: order.total,
    advanceAmount: order.advanceAmount,
    createdAt: order.createdAt.toISOString(),
    items: order.orderItems.map((item) => ({
      name: item.name,
      size: item.size,
      color: item.color,
      qty: item.qty,
    })),
  };
}
