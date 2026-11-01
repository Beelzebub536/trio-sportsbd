"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
    <section aria-label="Featured collections" className="relative mx-auto max-w-7xl px-4">
      <div
        ref={trackRef}
        className="flex snap-x snap-mandatory overflow-x-auto scroll-smooth rounded-3xl"
      >
        {banners.map((banner, index) => (
          <div
            key={banner.id}
            className="relative w-full shrink-0 snap-center"
          >
            <div className="relative aspect-[16/10] w-full bg-pitch-dark sm:aspect-[16/9] lg:aspect-[21/9]">
              <Image
                src={banner.imageUrl}
                alt={banner.title}
                fill
                                sizes="100vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--pitch-dark)/0.9)] via-[hsl(var(--pitch-dark)/0.5)] to-transparent" />
              <div className="absolute inset-0 flex max-w-xl flex-col justify-center gap-3 p-6 text-white md:p-16">
                <h2 className="text-3xl md:text-6xl">
                  {banner.title}
                </h2>
                {banner.subtitle && (
                  <p className="text-sm text-white/85 md:text-lg">
                    {banner.subtitle}
                  </p>
                )}
                <Link
                  href={banner.linkUrl}
                  className="press mt-2 inline-flex h-12 w-fit items-center rounded-full bg-white px-6 text-sm font-semibold text-background hover:bg-white/90"
                >
                  Shop now
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
            className="press absolute left-6 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 md:flex"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label="Next slide"
            onClick={() => scroll(1)}
            className="press absolute right-6 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 md:flex"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}
    </section>
  );
}
