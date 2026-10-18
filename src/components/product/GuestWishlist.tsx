"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { getGuestWishlistProductsAction } from "@/actions/wishlist";
import CachedListingPreview from "@/components/product/CachedListingPreview";
import LoadingSurface from "@/components/ui/LoadingSurface";
import { Skeleton } from "@/components/ui/skeleton";
import { useHydrated } from "@/lib/hooks";
import type { ProductCardData } from "@/lib/queries/products";
import { useWishlistStore } from "@/stores/wishlist";

export default function GuestWishlist() {
  const hydrated = useHydrated();
  const ids = useWishlistStore((state) => state.ids);
  const remove = useWishlistStore((state) => state.toggle);
  const [products, setProducts] = useState<ProductCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const idKey = [...ids].sort((a, b) => a - b).join(",");

  useEffect(() => {
    if (!hydrated) return;
    let cancelled = false;
    const currentIds = idKey ? idKey.split(",").map(Number) : [];
    setLoading(currentIds.length > 0);
    setLoadError(false);
    if (currentIds.length === 0) {
      setProducts([]);
      return;
    }

    getGuestWishlistProductsAction(currentIds)
      .then((result) => {
        if (!cancelled) setProducts(result);
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [hydrated, idKey]);

  return (
    <section>
      <h1 className="text-2xl font-bold uppercase leading-none md:text-3xl">
        Wishlist
      </h1>
      {loading ? (
        <LoadingSurface className="mt-6 min-h-[50vh]" label="Loading saved items">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="aspect-[4/5]" />
            ))}
          </div>
        </LoadingSurface>
      ) : loadError ? (
        <p className="mt-6 border border-destructive p-5 text-sm text-destructive" role="alert">
          We could not load saved items. Refresh this page to try again.
        </p>
      ) : products.length > 0 ? (
        <div className="mt-6">
          <CachedListingPreview products={products} onRemove={remove} />
        </div>
      ) : (
        <p className="mt-6 border border-border p-5 text-sm text-muted-foreground">
          Your wishlist is empty. Save products with the heart button, or{" "}
          <Link href="/shop" className="underline underline-offset-2">
            browse the shop
          </Link>
          . Sign in to sync your wishlist across devices.
        </p>
      )}
    </section>
  );
}
