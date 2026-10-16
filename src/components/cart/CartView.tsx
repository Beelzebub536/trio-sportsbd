"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";

import { getCartDetails, type CartLineDetails } from "@/actions/cart";
import { Button } from "@/components/ui/button";
import { formatBDT } from "@/lib/format";
import { useHydrated } from "@/lib/hooks";
import { useCartStore } from "@/stores/cart";

export default function CartView() {
  const items = useCartStore((state) => state.items);
  const setQty = useCartStore((state) => state.setQty);
  const remove = useCartStore((state) => state.remove);
  const hydrated = useHydrated();

  const [details, setDetails] = useState<CartLineDetails[]>([]);
  const snapshot = items.map((item) => `${item.variantId}:${item.qty}`).join(",");

  useEffect(() => {
    const current = useCartStore.getState().items;
    if (!hydrated || current.length === 0) {
      setDetails([]);
      return;
    }

    let cancelled = false;
    getCartDetails(
      current.map((item) => ({ variantId: item.variantId, qty: item.qty })),
    )
      .then((result) => {
        if (!cancelled) setDetails(result);
      })
      .catch(() => {
        if (!cancelled) setDetails([]);
      });

    return () => {
      cancelled = true;
    };
  }, [hydrated, snapshot]);

  if (!hydrated) {
    return <p className="py-16 text-sm text-muted-foreground">Loading your bag…</p>;
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
        <ShoppingBag className="h-10 w-10 text-muted-foreground" />
        <h2 className="text-xl font-bold uppercase">Your bag is empty</h2>
        <p className="max-w-md text-sm text-muted-foreground">
          Add a jersey, a pair of track pants or an accessory to get started.
        </p>
        <Button asChild>
          <Link href="/shop">Start shopping</Link>
        </Button>
      </div>
    );
  }

  const detailFor = (variantId: number) =>
    details.find((detail) => detail.variantId === variantId);

  const subtotal = details.reduce(
    (sum, detail) => sum + detail.unitPrice * detail.qty,
    0,
  );
  const hasProblem = details.some(
    (detail) => !detail.available || detail.stock < detail.qty,
  );

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_340px]">
      <ul className="divide-y divide-border border-y border-border">
        {items.map((line) => {
          const detail = detailFor(line.variantId);
          const priceChanged =
            detail && detail.unitPrice !== line.unitPrice && detail.unitPrice > 0;
          const lowStock = detail && detail.stock < line.qty;

          return (
            <li key={line.variantId} className="flex gap-4 py-5">
              <Link
                href={`/product/${line.slug}`}
                className="relative h-32 w-24 shrink-0 overflow-hidden bg-secondary"
              >
                {line.image && (
                  <Image
                    src={line.image}
                    alt={line.name}
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                )}
              </Link>

              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link
                      href={`/product/${line.slug}`}
                      className="text-sm font-semibold uppercase hover:underline"
                    >
                      {line.name}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {line.color} · {line.size}
                    </p>
                    <p className="mt-1 text-sm font-semibold">
                      {formatBDT(detail?.unitPrice || line.unitPrice)}
                    </p>
                  </div>
                  <button
                    type="button"
                    aria-label={`Remove ${line.name}`}
                    className="p-1 text-muted-foreground hover:text-[var(--brand-sale)]"
                    onClick={() => remove(line.variantId)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {priceChanged && (
                  <p className="mt-2 bg-secondary px-2 py-1 text-xs">
                    Price updated to {formatBDT(detail.unitPrice)}.{" "}
                    You will be charged the current price.
                  </p>
                )}

                {!detail ? (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Checking availability…
                  </p>
                ) : lowStock ? (
                  <p className="mt-2 bg-secondary px-2 py-1 text-xs text-[var(--brand-sale)]">
                    Only {detail.stock} left — please reduce the quantity.
                  </p>
                ) : null}

                <div className="mt-auto flex items-center gap-4 pt-3">
                  <div className="flex items-center border border-border">
                    <button
                      type="button"
                      aria-label="Decrease quantity"
                      className="p-2 hover:bg-secondary"
                      onClick={() => setQty(line.variantId, line.qty - 1)}
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-8 text-center text-sm">{line.qty}</span>
                    <button
                      type="button"
                      aria-label="Increase quantity"
                      className="p-2 hover:bg-secondary"
                      onClick={() => setQty(line.variantId, line.qty + 1)}
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <span className="text-sm font-semibold">
                    {formatBDT(
                      (detail?.unitPrice || line.unitPrice) * line.qty,
                    )}
                  </span>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <aside className="lg:sticky lg:top-28 lg:self-start">
        <div className="border border-border p-5">
          <h2 className="text-sm font-bold uppercase tracking-widest">Summary</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt>Subtotal</dt>
              <dd className="font-semibold">{formatBDT(subtotal)}</dd>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <dt>Delivery</dt>
              <dd>Calculated at checkout</dd>
            </div>
          </dl>

          <Button asChild className="mt-5 w-full" disabled={hasProblem}>
            <Link href={hasProblem ? "/cart" : "/checkout"}>
              Proceed to checkout
            </Link>
          </Button>

          {hasProblem && (
            <p className="mt-2 text-xs text-[var(--brand-sale)]">
              Please fix the highlighted items before checking out.
            </p>
          )}

          <Link
            href="/shop"
            className="mt-3 block text-center text-xs font-bold uppercase tracking-widest underline underline-offset-4 hover:decoration-2"
          >
            Continue shopping
          </Link>
        </div>
      </aside>
    </div>
  );
}
