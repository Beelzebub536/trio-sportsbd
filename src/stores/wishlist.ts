"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type WishlistState = {
  ids: number[];
  toggle: (id: number) => void;
  setIds: (ids: number[]) => void;
  clear: () => void;
};

/** Guest wishlist kept in localStorage; merged into the DB on login. */
export const useWishlistStore = create<WishlistState>()(
  persist(
    (set) => ({
      ids: [],
      toggle: (id) =>
        set((state) => ({
          ids: state.ids.includes(id)
            ? state.ids.filter((value) => value !== id)
            : [...state.ids, id],
        })),
      setIds: (ids) => set({ ids }),
      clear: () => set({ ids: [] }),
    }),
    {
      name: "trio-wishlist",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
