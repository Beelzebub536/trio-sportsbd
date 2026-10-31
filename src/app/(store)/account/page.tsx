import Link from "next/link";

import OrderStatusBadge from "@/components/order/OrderStatusBadge";
import { formatBDT } from "@/lib/format";
import prisma from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export default async function AccountOverviewPage() {
  const session = await requireUser();

  const lastOrder = await prisma.order.findFirst({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { orderItems: true },
  });

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold leading-none md:text-4xl">
          Hello, {session.user.name.split(" ")[0]}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Track orders, manage addresses and keep your wishlist up to date.
        </p>
      </header>

      <section>
        <h2 className="text-base font-semibold">
          Last order
        </h2>
        {lastOrder ? (
          <div className="mt-3 border border-border p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <Link
                  href={`/account/orders/${lastOrder.id}`}
                  className="font-semibold hover:underline"
                >
                  {lastOrder.orderNumber}
                </Link>
                <p className="text-xs text-muted-foreground">
                  {lastOrder.createdAt.toLocaleDateString("en-GB")} ·{" "}
                  {lastOrder.orderItems.length} item
                  {lastOrder.orderItems.length === 1 ? "" : "s"}
                </p>
              </div>
              <OrderStatusBadge status={lastOrder.status} />
            </div>
            <p className="mt-3 text-sm">
              Total{" "}
              <span className="font-semibold">{formatBDT(lastOrder.total)}</span>
            </p>
            <Link
              href={`/account/orders/${lastOrder.id}`}
              className="mt-3 inline-block text-sm font-semibold underline underline-offset-4 hover:decoration-2"
            >
              View order
            </Link>
          </div>
        ) : (
          <p className="mt-3 border border-border p-5 text-sm text-muted-foreground">
            You have not placed an order yet.{" "}
            <Link href="/shop" className="underline underline-offset-2">
              Start shopping
            </Link>
            .
          </p>
        )}
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {[
          { href: "/account/orders", title: "My orders", body: "See every order and its status." },
          { href: "/account/addresses", title: "Addresses", body: "Save addresses for faster checkout." },
          { href: "/account/wishlist", title: "Wishlist", body: "Products you saved for later." },
        ].map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="border border-border p-5 transition-colors hover:border-black"
          >
            <h3 className="text-sm font-bold">
              {card.title}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">{card.body}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}
