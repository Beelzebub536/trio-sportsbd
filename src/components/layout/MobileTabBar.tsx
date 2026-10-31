"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Home, LayoutGrid, Search, ShoppingBag } from "lucide-react";

import BagCount from "@/components/layout/BagCount";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/stores/cart";

// These pages show their own sticky action bar in the thumb zone instead.
const HIDDEN_ON = ["/product/", "/cart", "/checkout"];

const itemClass =
  "press flex min-h-14 flex-1 flex-col items-center justify-center gap-1 text-[11px] font-semibold";

export default function MobileTabBar({
  wishlistHref,
  onSearch,
}: {
  wishlistHref: string;
  onSearch: () => void;
}) {
  const pathname = usePathname();
  const openCart = useCartStore((state) => state.open);

  if (HIDDEN_ON.some((prefix) => pathname.startsWith(prefix))) return null;

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const links = [
    { href: "/", label: "Home", icon: Home },
    { href: "/shop", label: "Shop", icon: LayoutGrid },
  ];

  return (
    <nav
      aria-label="Quick"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-white pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_24px_hsl(var(--pitch-dark)/0.08)] lg:hidden"
    >
      <ul className="flex h-16 items-stretch">
        {links.map(({ href, label, icon: Icon }) => (
          <li key={href} className="flex flex-1">
            <Link
              href={href}
              aria-current={isActive(href) ? "page" : undefined}
              className={cn(itemClass, isActive(href) ? "text-primary" : "text-muted-foreground")}
            >
              <Icon className="h-6 w-6" aria-hidden />
              {label}
            </Link>
          </li>
        ))}
        <li className="flex flex-1">
          <button type="button" onClick={onSearch} className={cn(itemClass, "text-muted-foreground")}>
            <Search className="h-6 w-6" aria-hidden />
            Search
          </button>
        </li>
        <li className="flex flex-1">
          <Link
            href={wishlistHref}
            aria-current={isActive(wishlistHref) ? "page" : undefined}
            className={cn(itemClass, isActive(wishlistHref) ? "text-primary" : "text-muted-foreground")}
          >
            <Heart className="h-6 w-6" aria-hidden />
            Saved
          </Link>
        </li>
        <li className="flex flex-1">
          <button type="button" onClick={openCart} className={cn(itemClass, "relative text-muted-foreground")}>
            <span className="relative">
              <ShoppingBag className="h-6 w-6" aria-hidden />
              <BagCount className="-right-2.5 -top-1.5" />
            </span>
            Bag
          </button>
        </li>
      </ul>
    </nav>
  );
}
