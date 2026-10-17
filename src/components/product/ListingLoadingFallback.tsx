"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import CachedListingPreview from "@/components/product/CachedListingPreview";
import ListingSkeleton from "@/components/product/ListingSkeleton";
import {
  LISTING_CACHE_TTL_MS,
  makeListingCacheKey,
  useListingCache,
} from "@/stores/listing-cache";

export default function ListingLoadingFallback() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams?.toString() ?? "";
  const cacheKey = makeListingCacheKey(pathname ?? "/shop", search);
  const entry = useListingCache((state) => state.entries[cacheKey]);
  const [preview, setPreview] = useState<{
    cacheKey: string;
    products: NonNullable<typeof entry>["products"];
  } | null>(null);

  useEffect(() => {
    if (entry && Date.now() - entry.savedAt < LISTING_CACHE_TTL_MS) {
      setPreview({ cacheKey, products: entry.products });
    } else {
      setPreview(null);
    }
  }, [cacheKey, entry]);

  if (!preview || preview.cacheKey !== cacheKey) return <ListingSkeleton />;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <CachedListingPreview products={preview.products} />
    </div>
  );
}
