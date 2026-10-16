"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";

import { cn } from "@/lib/utils";

export type GalleryImage = { url: string; color: string | null };

export default function ProductGallery({
  images,
  selectedColor,
  productName,
}: {
  images: GalleryImage[];
  selectedColor: string;
  productName: string;
}) {
  const ordered = useMemo(() => {
    const matching = images.filter((image) => image.color === selectedColor);
    const rest = images.filter((image) => image.color !== selectedColor);
    return matching.length > 0 ? [...matching, ...rest] : images;
  }, [images, selectedColor]);

  const [index, setIndex] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);

  if (ordered.length === 0) {
    return <div className="aspect-[4/5] w-full bg-secondary" />;
  }

  const goTo = (target: number) => {
    setIndex(target);
    const track = trackRef.current;
    if (track) {
      track.scrollTo({ left: target * track.clientWidth, behavior: "smooth" });
    }
  };

  const handleScroll = () => {
    const track = trackRef.current;
    if (!track) return;
    const next = Math.round(track.scrollLeft / track.clientWidth);
    if (next !== index) setIndex(next);
  };

  return (
    <div className="flex flex-col-reverse gap-3 md:flex-row">
      <div className="flex gap-3 overflow-x-auto md:flex-col md:overflow-visible">
        {ordered.map((image, i) => (
          <button
            key={`${image.url}-${i}`}
            type="button"
            onClick={() => goTo(i)}
            aria-label={`View image ${i + 1}`}
            className={cn(
              "relative h-20 w-16 shrink-0 overflow-hidden bg-secondary",
              i === index ? "ring-2 ring-black" : "opacity-80 hover:opacity-100",
            )}
          >
            <Image src={image.url} alt="" fill sizes="64px" className="object-cover" />
          </button>
        ))}
      </div>

      <div
        ref={trackRef}
        onScroll={handleScroll}
        className="flex aspect-[4/5] flex-1 snap-x snap-mandatory overflow-x-auto"
      >
        {ordered.map((image, i) => (
          <div
            key={`${image.url}-main-${i}`}
            className="group relative w-full shrink-0 snap-center overflow-hidden bg-secondary"
          >
            <Image
              src={image.url}
              alt={`${productName} — view ${i + 1}`}
              fill
              priority={i === 0}
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
