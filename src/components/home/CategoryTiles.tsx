import Image from "next/image";
import Link from "next/link";

import type { CategoryNode } from "@/lib/queries/categories";

const FEATURED_SLUGS = ["jerseys", "trousers", "accessories"];

export default function CategoryTiles({
  categories,
}: {
  categories: CategoryNode[];
}) {
  const featured = FEATURED_SLUGS.map((slug) =>
    categories.find((category) => category.slug === slug),
  ).filter((category): category is CategoryNode => Boolean(category));

  const tiles = [
    ...featured.map((category) => ({
      name: category.name,
      href: `/${category.slug}`,
      image: category.image,
      highlight: false,
    })),
    { name: "Sale", href: "/sale", image: null, highlight: true },
  ];

  return (
    <section aria-label="Shop by category" className="mx-auto max-w-7xl px-4 py-8">
      <h2 className="mb-4 text-2xl font-bold uppercase md:text-3xl">
        Shop by category
      </h2>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {tiles.map((tile) => (
          <Link
            key={tile.href}
            href={tile.href}
            className="group relative block aspect-square overflow-hidden bg-black text-white"
          >
            {tile.image && (
              <Image
                src={tile.image}
                alt={tile.name}
                fill
                sizes="(max-width: 1024px) 50vw, 25vw"
                className="object-cover opacity-80 transition-transform duration-300 group-hover:scale-105"
              />
            )}
            <span className="absolute inset-0 flex items-end p-4">
              <span className="text-lg font-bold uppercase tracking-wide md:text-2xl">
                {tile.name}
              </span>
            </span>
            {tile.highlight && (
              <span className="absolute inset-0 border-2 border-[var(--brand-sale)]" />
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}
