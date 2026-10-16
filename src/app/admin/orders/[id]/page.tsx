import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import OrderStatusControls from "@/components/admin/OrderStatusControls";
import OrderStatusBadge from "@/components/order/OrderStatusBadge";
import OrderTimeline from "@/components/order/OrderTimeline";
import { formatBDT } from "@/lib/format";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  await requireAdmin();

  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();

  const order = await prisma.order.findUnique({
    where: { id },
    include: { orderItems: true },
  });

  if (!order) notFound();

  const balance = Math.max(0, order.total - order.advanceAmount);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            href="/admin/orders"
            className="text-xs font-bold uppercase tracking-widest underline underline-offset-4"
          >
            ← All orders
          </Link>
          <h1 className="mt-2 text-2xl font-bold uppercase leading-none md:text-3xl">
            {order.orderNumber}
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Placed {order.createdAt.toLocaleString("en-GB")}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="border border-border p-4">
        <OrderTimeline status={order.status} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="border border-border p-4 text-sm">
          <h2 className="text-sm font-bold uppercase tracking-widest">
            Customer
          </h2>
          <p className="mt-3 font-semibold">{order.customerName}</p>
          <p className="text-muted-foreground">{order.phone}</p>
          <p className="mt-1 text-muted-foreground">
            {order.address}, {order.upazila}, {order.district}, {order.division}
          </p>
          {order.note && (
            <p className="mt-3 bg-secondary p-2 text-xs">
              Customer note: {order.note}
            </p>
          )}
          <p className="mt-3 text-xs text-muted-foreground">
            <a
              href={`tel:${order.phone}`}
              className="underline underline-offset-2"
            >
              Call
            </a>
            {" · "}
            <a
              href={`https://wa.me/88${order.phone.replace(/^0/, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2"
            >
              WhatsApp
            </a>
          </p>
        </section>

        <section className="border border-border p-4 text-sm">
          <h2 className="text-sm font-bold uppercase tracking-widest">
            Payment
          </h2>
          <dl className="mt-3 space-y-2">
            <div className="flex justify-between">
              <dt>Subtotal</dt>
              <dd>{formatBDT(order.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Delivery</dt>
              <dd>{order.shippingFee === 0 ? "Free" : formatBDT(order.shippingFee)}</dd>
            </div>
            <div className="flex justify-between border-t border-border pt-2 font-bold">
              <dt>Total</dt>
              <dd>{formatBDT(order.total)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>
                Advance ({order.advanceMethod ?? "—"}) — {order.advanceStatus}
              </dt>
              <dd>{formatBDT(order.advanceAmount)}</dd>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <dt>Balance on delivery</dt>
              <dd>{formatBDT(balance)}</dd>
            </div>
          </dl>
          {order.advanceTrxId && (
            <p className="mt-3 text-xs text-muted-foreground">
              TrxID {order.advanceTrxId}
              {order.advanceSenderNumber
                ? ` from ${order.advanceSenderNumber}`
                : ""}
            </p>
          )}
        </section>
      </div>

      <section>
        <h2 className="text-sm font-bold uppercase tracking-widest">Items</h2>
        <ul className="mt-3 divide-y divide-border border-y border-border">
          {order.orderItems.map((item) => (
            <li key={item.id} className="flex items-center gap-4 py-3">
              <span className="relative h-16 w-14 shrink-0 overflow-hidden bg-secondary">
                {item.image && (
                  <Image src={item.image} alt="" fill sizes="56px" className="object-cover" />
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold uppercase">
                  {item.name}
                </span>
                <span className="block text-xs text-muted-foreground">
                  {item.color} · {item.size} · ×{item.qty}
                </span>
              </span>
              <span className="text-sm font-semibold">
                {formatBDT(item.unitPrice * item.qty)}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <OrderStatusControls
        id={order.id}
        status={order.status}
        advanceStatus={order.advanceStatus}
        balanceCollected={order.balanceCollected}
        adminNote={order.adminNote}
      />
    </div>
  );
}
