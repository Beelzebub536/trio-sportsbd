import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";

import OrderStatusBadge from "@/components/order/OrderStatusBadge";
import OrderTimeline from "@/components/order/OrderTimeline";
import { Button } from "@/components/ui/button";
import { formatBDT } from "@/lib/format";
import { verifyOrderToken } from "@/lib/order-token";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { getSettings } from "@/lib/settings";
import { expireStalePendingOrders } from "@/lib/order-expiry";
import { buildWhatsAppLink, orderStatusMessage } from "@/lib/whatsapp";

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ orderNumber: string }>;
  searchParams: Promise<{ token?: string }>;
}): Promise<Metadata> {
  const [{ orderNumber }, { token }] = await Promise.all([params, searchParams]);
  const order = await prisma.order.findUnique({
    where: { orderNumber },
    select: { userId: true },
  });
  if (!order) notFound();

  const session = await getSession();
  const isOwner = Boolean(session?.user?.id && order.userId === session.user.id);
  const tokenValid = typeof token === "string" && verifyOrderToken(orderNumber, token);
  if (!isOwner && !tokenValid) notFound();

  return {
    title: "Order confirmation",
    robots: { index: false, follow: false },
  };
}

const ADVANCE_NOTES: Record<string, string> = {
  PENDING:
    "We are checking your payment. Once verified, your order is confirmed.",
  VERIFIED: "Your online payment is verified. Your order is confirmed.",
  REJECTED:
    "We could not verify your advance payment. Please message us on WhatsApp so we can sort it out.",
};

export default async function OrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ orderNumber: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const { orderNumber } = await params;
  const { token } = await searchParams;

  await expireStalePendingOrders();

  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: { orderItems: true },
  });

  if (!order) notFound();

  const session = await getSession();
  const isOwner =
    Boolean(session?.user?.id) &&
    Boolean(order.userId) &&
    session?.user?.id === order.userId;
  const tokenValid =
    typeof token === "string" && verifyOrderToken(orderNumber, token);

  if (!isOwner && !tokenValid) notFound();

  const settings = await getSettings();
  const balance = Math.max(0, order.total - order.advanceAmount);

  const whatsappLink = buildWhatsAppLink(
    settings.whatsappNumber,
    orderStatusMessage({
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      phone: order.phone,
      address: order.address,
      upazila: order.upazila,
      district: order.district,
      division: order.division,
      total: order.total,
      advanceAmount: order.advanceAmount,
      advanceMethod: order.advanceMethod,
      advanceTrxId: order.advanceTrxId,
      items: order.orderItems.map((item) => ({
        name: item.name,
        size: item.size,
        color: item.color,
        qty: item.qty,
      })),
    }),
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="flex items-center gap-3">
        <CheckCircle2 className="h-8 w-8 text-[var(--brand-accent)]" aria-hidden />
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            Order placed
          </p>
          <h1 className="text-3xl font-bold uppercase leading-none md:text-4xl">
            {order.orderNumber}
          </h1>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <OrderStatusBadge status={order.status} />
        <span className="text-sm text-muted-foreground">
          {order.status === "CANCELLED"
            ? order.advanceAmount === 0
              ? "This unconfirmed order request expired or was cancelled. Contact the store if you still need help."
              : ADVANCE_NOTES[order.advanceStatus] ?? "This order was cancelled."
            : order.advanceAmount === 0
              ? "Your request is waiting for the store to review and confirm it. It expires after 24 hours."
              : ADVANCE_NOTES[order.advanceStatus] ?? ""}
        </span>
      </div>

      <div className="mt-8 border border-border p-5">
        <OrderTimeline status={order.status} />
      </div>

      <section className="mt-8">
        <h2 className="text-sm font-bold uppercase tracking-widest">Items</h2>
        <ul className="mt-3 divide-y divide-border border-y border-border">
          {order.orderItems.map((item) => (
            <li key={item.id} className="flex items-center gap-4 py-4">
              <span className="relative h-20 w-16 shrink-0 overflow-hidden bg-secondary">
                {item.image && (
                  <Image
                    src={item.image}
                    alt=""
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
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

      <section className="mt-8 grid gap-6 sm:grid-cols-2">
        <div className="border border-border p-5 text-sm">
          <h2 className="text-sm font-bold uppercase tracking-widest">
            Delivery to
          </h2>
          <p className="mt-3">{order.customerName}</p>
          <p className="text-muted-foreground">{order.phone}</p>
          <p className="mt-1 text-muted-foreground">
            {order.address}, {order.upazila}, {order.district}, {order.division}
          </p>
        </div>

        <div className="border border-border p-5 text-sm">
          <h2 className="text-sm font-bold uppercase tracking-widest">Payment</h2>
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
                  : `Online payment · ${order.advanceStatus.toLowerCase()}`}
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

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-black px-6 py-3 text-xs font-bold uppercase tracking-widest text-white hover:opacity-90"
        >
          {order.advanceAmount === 0 ? "Send order request on WhatsApp" : "Confirm on WhatsApp"}
        </a>
        <Button asChild variant="outline">
          <Link href="/shop">Continue shopping</Link>
        </Button>
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        Keep this page link to check your order, or use{" "}
        <Link href="/track" className="underline underline-offset-2">
          order tracking
        </Link>{" "}
        with your order number and phone.
      </p>
    </div>
  );
}
