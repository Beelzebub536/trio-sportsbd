"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type CartItem = {
  variantId: number;
  productId: number;
  name: string;
  slug: string;
  size: string;
  color: string;
  image: string | null;
  /** Display snapshot only — the server recomputes real prices at checkout. */
  unitPrice: number;
  qty: number;
};

type CartState = {
  items: CartItem[];
  hasHydrated: boolean;
  isOpen: boolean;
  add: (item: Omit<CartItem, "qty">, qty?: number) => void;
  remove: (variantId: number) => void;
  setQty: (variantId: number, qty: number) => void;
  clear: () => void;
  replace: (items: CartItem[]) => void;
  open: () => void;
  close: () => void;
  toggle: () => void;
  setHydrated: (value: boolean) => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      hasHydrated: false,
      isOpen: false,
      add: (item, qty = 1) =>
        set((state) => {
          const existing = state.items.find(
            (line) => line.variantId === item.variantId,
          );
          if (existing) {
            return {
              items: state.items.map((line) =>
                line.variantId === item.variantId
                  ? { ...line, qty: line.qty + qty, unitPrice: item.unitPrice }
                  : line,
              ),
              isOpen: true,
            };
          }
          return { items: [...state.items, { ...item, qty }], isOpen: true };
        }),
      remove: (variantId) =>
        set((state) => ({
          items: state.items.filter((line) => line.variantId !== variantId),
        })),
      setQty: (variantId, qty) =>
        set((state) => {
          if (qty <= 0) {
            return {
              items: state.items.filter((line) => line.variantId !== variantId),
            };
          }
          return {
            items: state.items.map((line) =>
              line.variantId === variantId ? { ...line, qty } : line,
            ),
          };
        }),
      clear: () => set({ items: [] }),
      replace: (items) => set({ items }),
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      toggle: () => set((state) => ({ isOpen: !state.isOpen })),
      setHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: "trio-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);

export const countItems = (items: CartItem[]): number =>
  items.reduce((total, line) => total + line.qty, 0);

export const subtotalOf = (items: CartItem[]): number =>
  items.reduce((total, line) => total + line.unitPrice * line.qty, 0);

export function useCartCountValue(): number {
  return useCartStore((state) =>
    state.items.reduce((total, line) => total + line.qty, 0),
  );
}
