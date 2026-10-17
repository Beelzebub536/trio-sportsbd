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
        <SheetHeader className="border-b border-border px-5 py-4 text-left">
          <SheetTitle className="text-lg font-bold uppercase">Menu</SheetTitle>
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
                      className="block py-4 text-sm font-bold uppercase tracking-wide"
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
                      <AccordionTrigger className="py-4 text-sm font-bold uppercase tracking-wide hover:no-underline">
                        {item.label}
                      </AccordionTrigger>
                      <AccordionContent className="pb-2">
                        <ul className="space-y-1 pl-1">
                          <li>
                            <Link
                              href={item.href}
                              onClick={close}
                              className="block py-2 text-sm"
                            >
                              All {item.label.toLowerCase()}
                            </Link>
                          </li>
                          {children.map((child) => (
                            <li key={child.id}>
                              <Link
                                href={`/shop?category=${encodeURIComponent(child.slug)}`}
                                onClick={close}
                                className="block py-2 text-sm text-muted-foreground"
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
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Account
          </p>
          <ul className="mt-2 space-y-1">
            {user ? (
              <>
                <li>
                  <Link href="/account" onClick={close} className="block py-2 text-sm">
                    My account
                  </Link>
                </li>
                <li>
                  <Link
                    href="/account/orders"
                    onClick={close}
                    className="block py-2 text-sm"
                  >
                    My orders
                  </Link>
                </li>
                <li>
                  <Link href="/account/wishlist" onClick={close} className="block py-2 text-sm">
                    Wishlist
                  </Link>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link href="/wishlist" onClick={close} className="block py-2 text-sm">
                    Wishlist
                  </Link>
                </li>
                <li>
                  <Link href="/login" onClick={close} className="block py-2 text-sm">
                    Sign in / Create account
                  </Link>
                </li>
              </>
            )}
            <li>
              <Link href="/track" onClick={close} className="block py-2 text-sm">
                Track an order
              </Link>
            </li>
          </ul>
        </div>

        <div className="border-t border-border px-5 py-4">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Help
          </p>
          <ul className="mt-2 space-y-1">
            {FOOTER_LINKS[1].links.map((link) => (
              <li key={link.href}>
                <Link href={link.href} onClick={close} className="block py-2 text-sm">
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
