import Link from "next/link";

import type { CategoryNode } from "@/lib/queries/categories";
import { cn } from "@/lib/utils";

const FEATURED = [
  { slug: "jerseys", blurb: "Club, country and training", tone: "bg-primary text-white" },
  { slug: "trousers", blurb: "Track pants and shorts", tone: "bg-foreground text-white" },
  { slug: "accessories", blurb: "Bags, socks, gloves, caps", tone: "bg-secondary text-foreground" },
];

export default function CategoryTiles({ categories }: { categories: CategoryNode[] }) {
  const tiles = [
    ...FEATURED.flatMap((tile) => {
      const category = categories.find((item) => item.slug === tile.slug);
      return category
        ? [{ ...tile, name: category.name, href: `/${category.slug}` }]
        : [];
    }),
    { slug: "sale", name: "Sale", blurb: "Up to 30% off", tone: "bg-sale text-white", href: "/sale" },
  ];

  return (
    <section aria-labelledby="shop-by-category" className="mx-auto max-w-7xl px-4 pt-12 md:pt-16">
      <h2 id="shop-by-category" className="text-4xl md:text-5xl">
        Shop by category
      </h2>
      <div className="mt-6 grid grid-cols-2 gap-2 md:gap-3 lg:grid-cols-4">
        {tiles.map((tile) => (
          <Link
            key={tile.href}
            href={tile.href}
            className={cn(
              "press group relative flex aspect-[4/5] flex-col justify-end overflow-hidden p-4 [container-type:inline-size] md:p-6",
              tile.tone,
            )}
          >
            <span className="font-display text-[clamp(1.5rem,15cqi,4rem)] font-extrabold uppercase leading-[0.85]">
              {tile.name}
            </span>
            <span className="mt-2 text-sm opacity-80">{tile.blurb}</span>
            <span
              aria-hidden
              className="absolute right-4 top-4 h-3 w-3 rotate-45 bg-current opacity-60 transition-transform duration-300 group-hover:rotate-[135deg]"
            />
          </Link>
        ))}
      </div>
    </section>
  );
}
