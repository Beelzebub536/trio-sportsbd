import Link from "next/link";

import Reveal from "@/components/motion/Reveal";
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
    <section className="mx-auto max-w-7xl py-12 md:px-4 md:py-16">
      <div className="mb-5 flex items-end justify-between gap-4 px-4 md:px-0">
        <h2 className="text-4xl md:text-5xl">{title}</h2>
        <Link
          href={href}
          className="shrink-0 py-2 text-sm font-semibold text-primary underline underline-offset-4 hover:decoration-2"
        >
          View all
        </Link>
      </div>

      {/* Phones: swipeable row that peeks the next card; desktop: 4-up grid. */}
      <Reveal className="flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] md:grid md:grid-cols-4 md:gap-x-4 md:gap-y-8 md:overflow-visible md:px-0">
        {products.map((product) => (
          <div key={product.id} className="w-[44%] shrink-0 snap-start sm:w-[30%] md:w-auto">
            <ProductCard product={product} />
          </div>
        ))}
      </Reveal>
    </section>
  );
}
