"use client";

import { useState } from "react";
import { Heart, Search, ShoppingBag } from "lucide-react";
import Link from "next/link";

import Logo from "@/components/brand/Logo";
import MobileMenu from "@/components/layout/MobileMenu";
import AccountMenu from "@/components/layout/AccountMenu";
import CartSheet from "@/components/layout/CartSheet";
import SearchOverlay from "@/components/layout/SearchOverlay";
import { useHydrated } from "@/lib/hooks";
import { PRIMARY_NAV } from "@/lib/nav";
import type { CategoryNode } from "@/lib/queries/categories";
import { useCartCountValue, useCartStore } from "@/stores/cart";

export type HeaderUser = {
  name: string;
  role?: string | null;
} | null;

export default function SiteHeader({
  categories,
  user,
  freeShippingThreshold,
}: {
  categories: CategoryNode[];
  user: HeaderUser;
  freeShippingThreshold: number;
}) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const hydrated = useHydrated();
  const count = useCartCountValue();
  const openCart = useCartStore((state) => state.open);

  const childrenFor = (slug: string | null) =>
    slug ? categories.find((category) => category.slug === slug)?.children ?? [] : [];

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-white">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
        <button
          type="button"
          aria-label="Open menu"
          className="p-1 lg:hidden"
          onClick={() => setMobileOpen(true)}
        >
          <span className="block h-0.5 w-6 bg-black" />
          <span className="mt-1.5 block h-0.5 w-6 bg-black" />
          <span className="mt-1.5 block h-0.5 w-6 bg-black" />
        </button>

        <Link href="/" className="shrink-0" aria-label="Trio Sports BD home">
          <Logo variant="header" />
        </Link>

        <nav aria-label="Main" className="mx-auto hidden lg:block">
          <ul className="flex items-center gap-6">
            {PRIMARY_NAV.map((item) => {
              const children = childrenFor(item.categorySlug);
              return (
                <li key={item.label} className="group relative">
                  <Link
                    href={item.href}
                    className="flex items-center gap-1 py-2 text-xs font-bold uppercase tracking-widest hover:underline hover:decoration-2 hover:underline-offset-4"
                  >
                    {item.label}
                  </Link>
                  {children.length > 0 && (
                    <div className="invisible absolute left-1/2 top-full z-50 w-[520px] -translate-x-1/2 border border-border bg-white p-6 opacity-0 shadow-lg transition-opacity duration-150 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                      <div className="grid grid-cols-2 gap-6">
                        {children.map((child) => (
                          <div key={child.id}>
                            <Link
                              href={`/shop?category=${encodeURIComponent(child.slug)}`}
                              className="text-sm font-bold uppercase tracking-wide hover:underline"
                            >
                              {child.name}
                            </Link>
                            <Link
                              href={`/shop?category=${encodeURIComponent(child.slug)}`}
                              className="mt-2 block text-xs text-muted-foreground underline-offset-4 hover:underline"
                            >
                              Shop {child.name.toLowerCase()}
                            </Link>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            aria-label="Search"
            className="p-2 hover:bg-secondary"
            onClick={() => setSearchOpen(true)}
          >
            <Search className="h-5 w-5" />
          </button>
          <Link
            href={user ? "/account/wishlist" : "/wishlist"}
            aria-label="Wishlist"
            className="hidden p-2 hover:bg-secondary sm:block"
          >
            <Heart className="h-5 w-5" />
          </Link>
          <AccountMenu user={user} />
          <button
            type="button"
            aria-label={`Open bag${hydrated && count > 0 ? `, ${count} ${count === 1 ? "item" : "items"}` : ""}`}
            className="relative p-2 hover:bg-secondary"
            onClick={openCart}
          >
            <ShoppingBag className="h-5 w-5" />
            {hydrated && count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center bg-[var(--brand-accent)] px-1 text-[10px] font-bold text-black">
                {count}
              </span>
            )}
          </button>
        </div>
      </div>

      <MobileMenu
        open={mobileOpen}
        onOpenChange={setMobileOpen}
        categories={categories}
        user={user}
      />
      <SearchOverlay open={searchOpen} onOpenChange={setSearchOpen} />
      <CartSheet freeShippingThreshold={freeShippingThreshold} />
    </header>
  );
}
