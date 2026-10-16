"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

import type { BannerData } from "@/lib/queries/banners";

export default function HeroCarousel({ banners }: { banners: BannerData[] }) {
  const trackRef = useRef<HTMLDivElement>(null);

  if (banners.length === 0) return null;

  const scroll = (direction: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({ left: direction * track.clientWidth, behavior: "smooth" });
  };

  return (
    <section aria-label="Featured collections" className="relative">
      <div
        ref={trackRef}
        className="flex snap-x snap-mandatory overflow-x-auto scroll-smooth"
      >
        {banners.map((banner, index) => (
          <div
            key={banner.id}
            className="relative w-full shrink-0 snap-center"
          >
            <div className="relative aspect-[4/5] w-full sm:aspect-[16/9] lg:aspect-[21/9]">
              <Image
                src={banner.imageUrl}
                alt={banner.title}
                fill
                priority={index === 0}
                sizes="100vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/35 to-transparent" />
              <div className="absolute inset-0 flex max-w-xl flex-col justify-center gap-3 p-6 text-white md:p-16">
                <h2 className="text-3xl font-bold uppercase leading-[0.95] md:text-6xl">
                  {banner.title}
                </h2>
                {banner.subtitle && (
                  <p className="text-sm text-white/85 md:text-lg">
                    {banner.subtitle}
                  </p>
                )}
                <Link
                  href={banner.linkUrl}
                  className="mt-1 inline-flex w-fit items-center gap-2 bg-white px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-black transition-colors hover:bg-[var(--brand-accent)]"
                >
                  Shop now <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {banners.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous slide"
            onClick={() => scroll(-1)}
            className="absolute left-2 top-1/2 hidden -translate-y-1/2 bg-white/85 p-2 hover:bg-white md:block"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label="Next slide"
            onClick={() => scroll(1)}
            className="absolute right-2 top-1/2 hidden -translate-y-1/2 bg-white/85 p-2 hover:bg-white md:block"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}
    </section>
  );
}
