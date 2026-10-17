import { create } from "zustand";

import type { ProductCardData } from "@/lib/queries/products";
import { makeListingCacheKey } from "@/lib/listing-cache-key";

const MAX_CACHED_LISTINGS = 16;
export const LISTING_CACHE_TTL_MS = 2 * 60 * 1000;

type ListingEntry = { products: ProductCardData[]; savedAt: number };
type ListingCacheState = {
  entries: Record<string, ListingEntry>;
  save: (key: string, products: ProductCardData[]) => void;
};

export const useListingCache = create<ListingCacheState>((set) => ({
  entries: {},
  save: (key, products) =>
    set((state) => {
      const now = Date.now();
      const entries = Object.fromEntries(
        Object.entries(state.entries).filter(
          ([, entry]) => now - entry.savedAt < LISTING_CACHE_TTL_MS,
        ),
      );
      delete entries[key];
      entries[key] = { products, savedAt: now };
      const keys = Object.keys(entries);
      while (keys.length > MAX_CACHED_LISTINGS) {
        delete entries[keys.shift() as string];
      }
      return { entries };
    }),
}));

export { makeListingCacheKey };
