"use client";

import { useEffect } from "react";

import type { ProductCardData } from "@/lib/queries/products";
import { useListingCache } from "@/stores/listing-cache";

export default function ListingCacheSeed({
  cacheKey,
  products,
}: {
  cacheKey: string;
  products: ProductCardData[];
}) {
  const save = useListingCache((state) => state.save);

  useEffect(() => {
    save(cacheKey, products);
  }, [cacheKey, products, save]);

  return null;
}
