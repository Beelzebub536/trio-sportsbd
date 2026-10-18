import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import OrderStatusBadge from "@/components/order/OrderStatusBadge";
import OrderTimeline from "@/components/order/OrderTimeline";
import { formatBDT, toWhatsAppNumber } from "@/lib/format";
import prisma from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { getSettings } from "@/lib/settings";

export const metadata = { title: "Order details" };

export default async function AccountOrderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await requireUser();
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();

  const order = await prisma.order.findFirst({
    where: { id, userId: session.user.id },
    include: { orderItems: true },
  });

  if (!order) notFound();

  const settings = await getSettings();
  const balance = Math.max(0, order.total - order.advanceAmount);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold uppercase leading-none md:text-3xl">
            {order.orderNumber}
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Placed {order.createdAt.toLocaleDateString("en-GB")}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="border border-border p-5">
        <OrderTimeline status={order.status} />
      </div>

      <section>
        <h2 className="text-sm font-bold uppercase tracking-widest">Items</h2>
        <ul className="mt-3 divide-y divide-border border-y border-border">
          {order.orderItems.map((item) => (
            <li key={item.id} className="flex items-center gap-4 py-4">
              <span className="relative h-20 w-16 shrink-0 overflow-hidden bg-secondary">
                {item.image && (
                  <Image src={item.image} alt="" fill sizes="64px" className="object-cover" />
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

      <section className="grid gap-6 sm:grid-cols-2">
        <div className="border border-border p-5 text-sm">
          <h2 className="text-sm font-bold uppercase tracking-widest">
            Delivery address
          </h2>
          <p className="mt-3">{order.customerName}</p>
          <p className="text-muted-foreground">{order.phone}</p>
          <p className="mt-1 text-muted-foreground">
            {order.address}, {order.upazila}, {order.district}, {order.division}
          </p>
        </div>

        <div className="border border-border p-5 text-sm">
          <h2 className="text-sm font-bold uppercase tracking-widest">Totals</h2>
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
                {order.advanceAmount === 0
                  ? "Payment method"
                  : `Online payment (${order.advanceMethod ?? "—"}) · ${order.advanceStatus.toLowerCase()}`}
              </dt>
              <dd>
                {order.advanceAmount === 0
                  ? "Cash on delivery"
                  : formatBDT(order.advanceAmount)}
              </dd>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <dt>Balance on delivery</dt>
              <dd>{formatBDT(balance)}</dd>
            </div>
          </dl>
        </div>
      </section>

      <div className="flex flex-wrap gap-3">
        <a
          href={`https://wa.me/${toWhatsAppNumber(
            settings.whatsappNumber,
          )}?text=${encodeURIComponent(
            `Hi, I need help with my order ${order.orderNumber}.`,
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-black px-5 py-3 text-xs font-bold uppercase tracking-widest text-white hover:opacity-90"
        >
          Need help? WhatsApp us
        </a>
        <Link
          href="/account/orders"
          className="border border-black px-5 py-3 text-xs font-bold uppercase tracking-widest hover:bg-secondary"
        >
          Back to orders
        </Link>
      </div>
    </div>
  );
}
