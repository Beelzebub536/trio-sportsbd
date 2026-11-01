import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { PHOTOS } from "@/lib/photos";
import type { CategoryNode } from "@/lib/queries/categories";
import { cn } from "@/lib/utils";

const FEATURED = [
  { slug: "jerseys", blurb: "Club, country and training", photo: PHOTOS.jerseys },
  { slug: "trousers", blurb: "Track pants and shorts", photo: PHOTOS.trousers },
  { slug: "accessories", blurb: "Balls, bags, socks, gloves", photo: PHOTOS.accessories },
] as const;

export default function CategoryTiles({ categories }: { categories: CategoryNode[] }) {
  const tiles = [
    ...FEATURED.flatMap((tile) => {
      const category = categories.find((item) => item.slug === tile.slug);
      return category ? [{ ...tile, name: category.name, href: `/${category.slug}`, sale: false }] : [];
    }),
    { slug: "sale", name: "Sale", blurb: "Up to 30% off", photo: PHOTOS.sale, href: "/sale", sale: true },
  ];

  return (
    <section aria-labelledby="shop-by-category" className="mx-auto max-w-7xl px-4 pt-16 md:pt-24">
      <h2 id="shop-by-category" className="text-3xl md:text-5xl">
        Shop by category
      </h2>
      <div className="mt-6 grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
        {tiles.map((tile) => (
          <Link
            key={tile.href}
            href={tile.href}
            className="press group relative isolate flex aspect-[3/4] flex-col justify-end overflow-hidden rounded-2xl bg-card p-4 md:p-5"
          >
            <Image
              src={tile.photo.src}
              alt=""
              fill
              sizes="(max-width: 1024px) 50vw, 25vw"
              quality={60}
              className="-z-20 object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <span
              aria-hidden
              className={cn(
                "absolute inset-0 -z-10",
                tile.sale
                  ? "bg-[linear-gradient(to_top,hsl(var(--destructive)/0.9),hsl(var(--destructive)/0.15)_70%)]"
                  : "bg-[linear-gradient(to_top,hsl(var(--background)/0.92),transparent_65%)]",
              )}
            />
            <span className="font-display text-2xl font-extrabold tracking-tight text-white md:text-3xl">
              {tile.name}
            </span>
            <span className="mt-1 text-sm text-white/80">{tile.blurb}</span>
            <span
              aria-hidden
              className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/30 text-white transition-colors group-hover:bg-primary group-hover:text-primary-foreground"
            >
              <ArrowUpRight className="h-5 w-5" />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
