"use client";

import { usePathname, useSearchParams } from "next/navigation";

import CachedListingPreview from "@/components/product/CachedListingPreview";
import { Skeleton } from "@/components/ui/skeleton";
import { LISTING_CACHE_TTL_MS, useListingCache } from "@/stores/listing-cache";
import { makeListingCacheKey } from "@/lib/listing-cache-key";

/** Shared skeleton for every product listing route. */
export default function ListingSkeleton() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();
  const key = makeListingCacheKey(pathname, search);
  const entry = useListingCache((state) => state.entries[key]);
  const cachedProducts =
    entry && Date.now() - entry.savedAt < LISTING_CACHE_TTL_MS
      ? entry.products
      : null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="mt-3 h-4 w-72" />

      {cachedProducts ? (
        <div className="mt-8">
          <CachedListingPreview products={cachedProducts} />
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <Skeleton className="aspect-[4/5] w-full" />
              <Skeleton className="h-3 w-3/4" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
