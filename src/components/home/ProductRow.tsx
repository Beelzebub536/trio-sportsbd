import Link from "next/link";

import ProductCard from "@/components/product/ProductCard";
import type { ProductCardData } from "@/lib/queries/products";

export default function ProductRow({
  title,
  href,
  products,
}: {
  title: string;
  href: string;
  products: ProductCardData[];
}) {
  if (products.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-4 flex items-end justify-between gap-4">
        <h2 className="text-2xl font-bold uppercase md:text-3xl">{title}</h2>
        <Link
          href={href}
          className="shrink-0 text-xs font-bold uppercase tracking-widest underline underline-offset-4 hover:decoration-2"
        >
          View all
        </Link>
      </div>

      <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 md:grid md:grid-cols-4 md:gap-4 md:overflow-visible">
        {products.map((product) => (
          <div
            key={product.id}
            className="w-[46%] shrink-0 snap-start sm:w-[30%] md:w-auto"
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
}
