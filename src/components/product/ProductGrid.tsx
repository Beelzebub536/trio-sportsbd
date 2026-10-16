import Link from "next/link";

import ProductCard from "@/components/product/ProductCard";
import type { ProductCardData } from "@/lib/queries/products";

export default function ProductGrid({
  products,
  isAuthed = false,
  savedIds = [],
}: {
  products: ProductCardData[];
  isAuthed?: boolean;
  savedIds?: number[];
}) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
        <h2 className="text-xl font-bold uppercase">No products found</h2>
        <p className="max-w-md text-sm text-muted-foreground">
          Try removing a filter or two, or browse everything in the shop.
        </p>
        <Link
          href="/shop"
          className="mt-2 bg-black px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-white hover:opacity-90"
        >
          Browse all products
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          isAuthed={isAuthed}
          saved={savedIds.includes(product.id)}
          priority={index < 4}
        />
      ))}
    </div>
  );
}
