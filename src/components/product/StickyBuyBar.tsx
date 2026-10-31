"use client";

import { ShoppingBag } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatBDT } from "@/lib/format";
import { cn } from "@/lib/utils";

/** Phones only: keeps the purchase action in the thumb zone (the tab bar is hidden here). */
export default function StickyBuyBar({
  price,
  onSale,
  label,
  disabled,
  onClick,
}: {
  price: number;
  onSale: boolean;
  label: string;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 border-t border-border bg-white px-4 pb-[calc(env(safe-area-inset-bottom)+8px)] pt-2 shadow-[0_-8px_24px_hsl(var(--pitch-dark)/0.08)] lg:hidden">
      <span className={cn("price text-xl font-bold", onSale && "text-sale")}>{formatBDT(price)}</span>
      <Button type="button" onClick={onClick} disabled={disabled} className="h-12 flex-1">
        <ShoppingBag className="h-5 w-5" />
        {label}
      </Button>
    </div>
  );
}
