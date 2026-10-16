import type { Metadata } from "next";

import CartView from "@/components/cart/CartView";

export const metadata: Metadata = {
  title: "Your bag",
};

export default function CartPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold uppercase leading-none md:text-4xl">
        Your bag
      </h1>
      <CartView />
    </div>
  );
}
