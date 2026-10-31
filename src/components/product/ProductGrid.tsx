import Link from "next/link";

import Reveal from "@/components/motion/Reveal";
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
        <h2 className="text-4xl">No products found</h2>
        <p className="max-w-md text-sm text-muted-foreground">
          Try removing a filter or two, or browse everything in the shop.
        </p>
        <Link
          href="/shop"
          className="press mt-2 inline-flex h-12 items-center bg-primary px-6 text-sm font-bold text-white hover:bg-pitch-dark"
        >
          Browse all products
        </Link>
      </div>
    );
  }

  return (
    <Reveal className="grid grid-cols-2 gap-x-3 gap-y-8 md:gap-x-4 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          isAuthed={isAuthed}
          saved={savedIds.includes(product.id)}
          priority={index < 4}
        />
      ))}
    </Reveal>
  );
}
