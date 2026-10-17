"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { formatBDT } from "@/lib/format";
import { useHydrated } from "@/lib/hooks";
import { subtotalOf, useCartStore } from "@/stores/cart";
import { cn } from "@/lib/utils";

export default function CartSheet({
  freeShippingThreshold,
}: {
  freeShippingThreshold: number;
}) {
  const items = useCartStore((state) => state.items);
  const isOpen = useCartStore((state) => state.isOpen);
  const close = useCartStore((state) => state.close);
  const setQty = useCartStore((state) => state.setQty);
  const remove = useCartStore((state) => state.remove);
  const hydrated = useHydrated();
  const totalQty = items.reduce((sum, item) => sum + item.qty, 0);

  const subtotal = hydrated ? subtotalOf(items) : 0;
  const remaining = Math.max(0, freeShippingThreshold - subtotal);
  const progress =
    freeShippingThreshold > 0
      ? Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100))
      : 100;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => (open ? undefined : close())}>
      <SheetContent side="right" className="flex w-full flex-col p-0 sm:max-w-md">
        <SheetHeader className="border-b border-border px-5 py-4 text-left">
          <SheetTitle className="text-lg font-bold uppercase">
            Your bag{hydrated && totalQty > 0 ? ` (${totalQty})` : ""}
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <ShoppingBag className="h-10 w-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Your bag is empty.</p>
            <Button asChild onClick={close}>
              <Link href="/shop">Start shopping</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="border-b border-border px-5 py-4">
              {remaining > 0 ? (
                <p className="text-xs">
                  Add{" "}
                  <span className="font-bold">{formatBDT(remaining)}</span> more
                  for free delivery
                </p>
              ) : (
                <p className="text-xs font-bold uppercase tracking-wide text-[var(--brand-sale)]">
                  You&apos;ve unlocked free delivery
                </p>
              )}
              <div className="mt-2 h-1 w-full bg-secondary">
                <div
                  className="h-1 bg-black transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <ul className="flex-1 overflow-y-auto px-5">
              {items.map((line) => (
                <li
                  key={line.variantId}
                  className="flex gap-3 border-b border-border py-4"
                >
                  <Link
                    href={`/product/${line.slug}`}
                    onClick={close}
                    className="relative h-24 w-20 shrink-0 overflow-hidden bg-secondary"
                  >
                    {line.image && (
                      <Image
                        src={line.image}
                        alt={line.name}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    )}
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <Link
                      href={`/product/${line.slug}`}
                      onClick={close}
                      className="text-xs font-semibold uppercase hover:underline"
                    >
                      {line.name}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {line.color} · {line.size}
                    </p>
                    <p className="mt-1 text-sm font-semibold">
                      {formatBDT(line.unitPrice)}
                    </p>

                    <div className="mt-auto flex items-center justify-between pt-2">
                      <div className="flex items-center border border-border">
                        <button
                          type="button"
                          aria-label="Decrease quantity"
                          className="p-1.5 hover:bg-secondary"
                          onClick={() => setQty(line.variantId, line.qty - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-8 text-center text-xs">{line.qty}</span>
                        <button
                          type="button"
                          aria-label="Increase quantity"
                          className="p-1.5 hover:bg-secondary"
                          onClick={() => setQty(line.variantId, line.qty + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <button
                        type="button"
                        aria-label={`Remove ${line.name}`}
                        className="p-1.5 text-muted-foreground hover:text-[var(--brand-sale)]"
                        onClick={() => remove(line.variantId)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="border-t border-border px-5 py-4">
              <div className="flex items-center justify-between text-sm">
                <span className="uppercase tracking-wide">Subtotal</span>
                <span className="font-bold">{formatBDT(subtotal)}</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Final prices and delivery are confirmed at checkout.
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Button asChild variant="outline" onClick={close}>
                  <Link href="/cart">View bag</Link>
                </Button>
                <Button asChild onClick={close} className={cn("w-full")}>
                  <Link href="/checkout">Checkout</Link>
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
