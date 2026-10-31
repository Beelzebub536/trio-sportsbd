"use client";

import { useEffect, useState } from "react";
import { Heart, Menu, Search, ShoppingBag } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";

import Logo from "@/components/brand/Logo";
import AccountMenu from "@/components/layout/AccountMenu";
import BagCount from "@/components/layout/BagCount";
import MobileTabBar from "@/components/layout/MobileTabBar";

// Drawers only open on a tap, so their Radix code loads after hydration instead of with first paint.
const CartSheet = dynamic(() => import("@/components/layout/CartSheet"), { ssr: false });
const MobileMenu = dynamic(() => import("@/components/layout/MobileMenu"), { ssr: false });
const SearchOverlay = dynamic(() => import("@/components/layout/SearchOverlay"), { ssr: false });
import { PRIMARY_NAV } from "@/lib/nav";
import type { CategoryNode } from "@/lib/queries/categories";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/stores/cart";

export type HeaderUser = {
  name: string;
  role?: string | null;
} | null;

const iconButton = "press flex h-11 w-11 items-center justify-center hover:bg-secondary";

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
  const [scrolled, setScrolled] = useState(false);
  const openCart = useCartStore((state) => state.open);
  const wishlistHref = user ? "/account/wishlist" : "/wishlist";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const childrenFor = (slug: string | null) =>
    slug ? categories.find((category) => category.slug === slug)?.children ?? [] : [];

  return (
    <header
      className={cn(
        "sticky top-0 z-40 bg-background transition-shadow duration-200",
        scrolled ? "shadow-[0_1px_0_hsl(var(--border)),0_12px_32px_rgb(0_0_0/0.45)]" : "shadow-[0_1px_0_hsl(var(--border))]",
      )}
    >
      <div
        className={cn(
          "mx-auto flex max-w-7xl items-center gap-2 px-2 transition-[height] duration-200 sm:px-4",
          scrolled ? "h-14" : "h-14 lg:h-[72px]",
        )}
      >
        <button
          type="button"
          aria-label="Open menu"
          className={cn(iconButton, "lg:hidden")}
          onClick={() => setMobileOpen(true)}
        >
          <Menu className="h-6 w-6" />
        </button>

        <Link href="/" className="press shrink-0 px-1" aria-label="Trio Sports BD home">
          <Logo />
        </Link>

        <nav aria-label="Main" className="mx-auto hidden h-full lg:block">
          <ul className="flex h-full items-center gap-7">
            {PRIMARY_NAV.map((item) => {
              const children = childrenFor(item.categorySlug);
              const isSale = item.href === "/sale";
              return (
                <li key={item.label} className="group relative flex h-full items-center">
                  <Link
                    href={item.href}
                    className={cn(
                      "relative py-2 text-[15px] font-semibold after:absolute after:inset-x-0 after:-bottom-0.5 after:h-[3px] after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-200 group-hover:after:scale-x-100 group-focus-within:after:scale-x-100",
                      isSale && "text-sale",
                    )}
                  >
                    {item.label}
                  </Link>
                  {children.length > 0 && (
                    <div className="invisible absolute left-1/2 top-full z-50 w-[560px] -translate-x-1/2 translate-y-2 rounded-2xl border border-border bg-card p-6 opacity-0 shadow-[0_24px_48px_rgb(0_0_0/0.5)] transition duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
                      <div className="grid grid-cols-[1fr_1fr_160px] gap-6">
                        {children.map((child) => (
                          <Link
                            key={child.id}
                            href={`/shop?category=${encodeURIComponent(child.slug)}`}
                            className="text-base font-semibold leading-tight hover:text-primary"
                          >
                            {child.name}
                          </Link>
                        ))}
                        <Link
                          href={item.href}
                          className="floodlight row-span-3 col-start-3 row-start-1 flex min-h-28 items-end rounded-xl p-3 font-display text-xl font-extrabold leading-none text-white"
                        >
                          Shop all {item.label.toLowerCase()}
                        </Link>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="ml-auto flex items-center">
          <button
            type="button"
            aria-label="Search"
            className={cn(iconButton, "hidden lg:flex")}
            onClick={() => setSearchOpen(true)}
          >
            <Search className="h-5 w-5" />
          </button>
          <Link href={wishlistHref} aria-label="Wishlist" className={cn(iconButton, "hidden lg:flex")}>
            <Heart className="h-5 w-5" />
          </Link>
          <AccountMenu user={user} />
          <button
            type="button"
            className={cn(iconButton, "relative hidden lg:flex")}
            onClick={openCart}
          >
            <ShoppingBag className="h-5 w-5" aria-hidden />
            <span className="sr-only">Open bag</span>
            <BagCount className="right-0.5 top-0.5" />
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
      <MobileTabBar wishlistHref={wishlistHref} onSearch={() => setSearchOpen(true)} />
    </header>
  );
}
