import Link from "next/link";

import OrderStatusBadge from "@/components/order/OrderStatusBadge";
import { formatBDT } from "@/lib/format";
import prisma from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export const metadata = { title: "My orders" };

export default async function AccountOrdersPage() {
  const session = await requireUser();

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { orderItems: true },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold uppercase leading-none md:text-3xl">
        My orders
      </h1>

      {orders.length === 0 ? (
        <p className="mt-6 border border-border p-5 text-sm text-muted-foreground">
          You have not placed an order yet.{" "}
          <Link href="/shop" className="underline underline-offset-2">
            Start shopping
          </Link>
          .
        </p>
      ) : (
        <ul className="mt-6 divide-y divide-border border-y border-border">
          {orders.map((order) => (
            <li key={order.id} className="flex flex-wrap items-center gap-4 py-5">
              <div className="min-w-0 flex-1">
                <Link
                  href={`/account/orders/${order.id}`}
                  className="font-semibold uppercase hover:underline"
                >
                  {order.orderNumber}
                </Link>
                <p className="text-xs text-muted-foreground">
                  {order.createdAt.toLocaleDateString("en-GB")} ·{" "}
                  {order.orderItems.length} item
                  {order.orderItems.length === 1 ? "" : "s"} ·{" "}
                  {formatBDT(order.total)}
                </p>
              </div>
              <OrderStatusBadge status={order.status} />
              <Link
                href={`/account/orders/${order.id}`}
                className="text-xs font-bold uppercase tracking-widest underline underline-offset-4 hover:decoration-2"
              >
                View
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
