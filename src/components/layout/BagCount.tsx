"use client";

import { useHydrated } from "@/lib/hooks";
import { cn } from "@/lib/utils";
import { useCartCountValue } from "@/stores/cart";

/** Bag item count badge; re-keyed on change so it pops when something is added. */
export default function BagCount({ className }: { className?: string }) {
  const hydrated = useHydrated();
  const count = useCartCountValue();
  if (!hydrated || count === 0) return null;

  return (
    <>
      <span
        key={count}
        aria-hidden
        className={cn(
          "price absolute flex h-5 min-w-5 animate-[pop_350ms_cubic-bezier(.3,1.6,.5,1)] items-center justify-center rounded-full bg-sale px-1 text-[11px] font-bold text-white",
          className,
        )}
      >
        {count}
      </span>
      <span className="sr-only">
        , {count} {count === 1 ? "item" : "items"}
      </span>
    </>
  );
}
