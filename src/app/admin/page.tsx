import Link from "next/link";

import OrderStatusBadge from "@/components/order/OrderStatusBadge";
import { formatBDT } from "@/lib/format";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";

export default async function AdminDashboardPage() {
  await requireAdmin();

  const [
    productCount,
    activeProductCount,
    customerCount,
    orderCount,
    pendingOrders,
    revenue,
    recentOrders,
    lowStock,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { isActive: true } }),
    prisma.user.count({ where: { role: { not: "admin" } } }),
    prisma.order.count(),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.order.aggregate({
      _sum: { total: true },
      where: { status: { not: "CANCELLED" } },
    }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      select: {
        id: true,
        orderNumber: true,
        customerName: true,
        total: true,
        status: true,
        createdAt: true,
      },
    }),
    prisma.productVariant.findMany({
      where: { stock: { lte: 5 }, product: { isActive: true } },
      orderBy: { stock: "asc" },
      take: 6,
      select: {
        id: true,
        size: true,
        color: true,
        stock: true,
        product: { select: { name: true, slug: true } },
      },
    }),
  ]);

  const stats = [
    { label: "Products", value: `${activeProductCount} / ${productCount}`, hint: "active / total" },
    { label: "Orders", value: String(orderCount), hint: `${pendingOrders} pending` },
    { label: "Customers", value: String(customerCount), hint: "registered" },
    { label: "Revenue", value: formatBDT(revenue._sum.total ?? 0), hint: "excluding cancelled" },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold uppercase leading-none md:text-3xl">
        Dashboard
      </h1>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="border border-border p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              {stat.label}
            </p>
            <p className="mt-2 text-2xl font-bold">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.hint}</p>
          </div>
        ))}
      </div>

      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-widest">
            Recent orders
          </h2>
          <Link
            href="/admin/orders"
            className="text-xs font-bold uppercase tracking-widest underline underline-offset-4"
          >
            All orders
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <p className="mt-3 border border-border p-4 text-sm text-muted-foreground">
            No orders yet.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-border border-y border-border">
            {recentOrders.map((order) => (
              <li key={order.id} className="flex flex-wrap items-center gap-3 py-3">
                <Link
                  href={`/admin/orders/${order.id}`}
                  className="font-semibold uppercase hover:underline"
                >
                  {order.orderNumber}
                </Link>
                <span className="text-sm text-muted-foreground">
                  {order.customerName}
                </span>
                <span className="ml-auto text-sm font-semibold">
                  {formatBDT(order.total)}
                </span>
                <OrderStatusBadge status={order.status} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-widest">
            Low stock (5 or fewer)
          </h2>
          <Link
            href="/admin/products"
            className="text-xs font-bold uppercase tracking-widest underline underline-offset-4"
          >
            Products
          </Link>
        </div>

        {lowStock.length === 0 ? (
          <p className="mt-3 border border-border p-4 text-sm text-muted-foreground">
            Everything is well stocked.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-border border-y border-border">
            {lowStock.map((variant) => (
              <li key={variant.id} className="flex items-center gap-3 py-3 text-sm">
                <span className="min-w-0 flex-1 truncate">
                  {variant.product.name}{" "}
                  <span className="text-muted-foreground">
                    ({variant.color} / {variant.size})
                  </span>
                </span>
                <span className="font-bold text-[var(--brand-sale)]">
                  {variant.stock} left
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
