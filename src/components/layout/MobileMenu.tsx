"use client";

import Link from "next/link";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { FOOTER_LINKS, PRIMARY_NAV } from "@/lib/nav";
import type { CategoryNode } from "@/lib/queries/categories";

import type { HeaderUser } from "./SiteHeader";

export default function MobileMenu({
  open,
  onOpenChange,
  categories,
  user,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: CategoryNode[];
  user: HeaderUser;
}) {
  const close = () => onOpenChange(false);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-full overflow-y-auto p-0 sm:max-w-sm">
        <SheetHeader className="pitch-stripes px-5 py-6 text-left">
          <SheetTitle className="font-display text-3xl font-extrabold uppercase text-white">Shop the game</SheetTitle>
        </SheetHeader>

        <nav aria-label="Mobile" className="px-5 py-4">
          <ul className="divide-y divide-border">
            {PRIMARY_NAV.map((item) => {
              const children = item.categorySlug
                ? categories.find((c) => c.slug === item.categorySlug)?.children ?? []
                : [];

              if (children.length === 0) {
                return (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      onClick={close}
                      className={`press block py-4 font-display text-2xl font-bold uppercase ${item.href === "/sale" ? "text-sale" : ""}`}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              }

              return (
                <li key={item.label}>
                  <Accordion type="single" collapsible>
                    <AccordionItem value={item.label} className="border-0">
                      <AccordionTrigger className="py-4 font-display text-2xl font-bold uppercase hover:no-underline">
                        {item.label}
                      </AccordionTrigger>
                      <AccordionContent className="pb-2">
                        <ul className="space-y-1 pl-1">
                          <li>
                            <Link
                              href={item.href}
                              onClick={close}
                              className="block py-3 text-base"
                            >
                              All {item.label.toLowerCase()}
                            </Link>
                          </li>
                          {children.map((child) => (
                            <li key={child.id}>
                              <Link
                                href={`/shop?category=${encodeURIComponent(child.slug)}`}
                                onClick={close}
                                className="block py-3 text-base text-muted-foreground"
                              >
                                {child.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-border px-5 py-4">
          <p className="text-sm font-semibold text-muted-foreground">
            Your account
          </p>
          <ul className="mt-2 space-y-1">
            {user ? (
              <>
                <li>
                  <Link href="/account" onClick={close} className="block py-3 text-base">
                    My account
                  </Link>
                </li>
                <li>
                  <Link
                    href="/account/orders"
                    onClick={close}
                    className="block py-3 text-base"
                  >
                    My orders
                  </Link>
                </li>
                <li>
                  <Link href="/account/wishlist" onClick={close} className="block py-3 text-base">
                    Wishlist
                  </Link>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link href="/wishlist" onClick={close} className="block py-3 text-base">
                    Wishlist
                  </Link>
                </li>
                <li>
                  <Link href="/login" onClick={close} className="block py-3 text-base">
                    Sign in / Create account
                  </Link>
                </li>
              </>
            )}
            <li>
              <Link href="/track" onClick={close} className="block py-3 text-base">
                Track an order
              </Link>
            </li>
          </ul>
        </div>

        <div className="border-t border-border px-5 py-4">
          <p className="text-sm font-semibold text-muted-foreground">
            Help
          </p>
          <ul className="mt-2 space-y-1">
            {FOOTER_LINKS[1].links.map((link) => (
              <li key={link.href}>
                <Link href={link.href} onClick={close} className="block py-3 text-base">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </SheetContent>
    </Sheet>
  );
}
