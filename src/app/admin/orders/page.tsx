import Link from "next/link";

import OrderStatusBadge from "@/components/order/OrderStatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatBDT } from "@/lib/format";
import { expireUnverifiedOnlineOrders } from "@/lib/order-expiry";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { cn } from "@/lib/utils";

const STATUSES = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "RETURNED",
];

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: { status?: string; q?: string };
}) {
  await requireAdmin();
  await expireUnverifiedOnlineOrders();
  const params = await searchParams;
  const status = typeof params.status === "string" ? params.status : "";
  const query = typeof params.q === "string" ? params.q.trim() : "";

  const orders = await prisma.order.findMany({
    where: {
      ...(status ? { status: status as never } : {}),
      ...(query
        ? {
            OR: [
              { orderNumber: { contains: query, mode: "insensitive" } },
              { phone: { contains: query } },
              { customerName: { contains: query, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { orderItems: true },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold uppercase leading-none md:text-3xl">
        Orders
      </h1>

      <div className="flex flex-wrap gap-2">
        <Link
          href="/admin/orders"
          className={cn(
            "border px-3 py-1.5 text-xs font-bold uppercase tracking-widest",
            !status ? "border-black bg-black text-white" : "border-border",
          )}
        >
          All
        </Link>
        {STATUSES.map((option) => (
          <Link
            key={option}
            href={`/admin/orders?status=${option}`}
            className={cn(
              "border px-3 py-1.5 text-xs font-bold uppercase tracking-widest",
              status === option
                ? "border-black bg-black text-white"
                : "border-border",
            )}
          >
            {option}
          </Link>
        ))}
      </div>

      <form method="get" className="flex max-w-md gap-2">
        <Input
          name="q"
          defaultValue={query}
          placeholder="Order number, phone or name"
          aria-label="Search orders"
        />
        <Button type="submit" variant="outline">
          Search
        </Button>
      </form>

      {orders.length === 0 ? (
        <p className="border border-border p-5 text-sm text-muted-foreground">
          No orders found.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-widest text-muted-foreground">
                <th className="py-2 pr-4">Order</th>
                <th className="py-2 pr-4">Customer</th>
                <th className="py-2 pr-4">Items</th>
                <th className="py-2 pr-4">Total</th>
                <th className="py-2 pr-4">Advance</th>
                <th className="py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-border">
                  <td className="py-3 pr-4">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="font-semibold uppercase hover:underline"
                    >
                      {order.orderNumber}
                    </Link>
                    <span className="block text-xs text-muted-foreground">
                      {order.createdAt.toLocaleDateString("en-GB")}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    {order.customerName}
                    <span className="block text-xs text-muted-foreground">
                      {order.phone}
                    </span>
                  </td>
                  <td className="py-3 pr-4">{order.orderItems.length}</td>
                  <td className="py-3 pr-4 font-semibold">
                    {formatBDT(order.total)}
                  </td>
                  <td className="py-3 pr-4 text-xs">
                    {order.advanceAmount === 0
                      ? "COD REQUEST"
                      : `PAYMENT ${order.advanceStatus}`}
                  </td>
                  <td className="py-3">
                    <OrderStatusBadge status={order.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
