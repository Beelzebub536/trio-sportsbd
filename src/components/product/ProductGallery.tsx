"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Maximize2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { getListingImageUrl } from "@/lib/image-url";
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
  const [viewFullSize, setViewFullSize] = useState(false);
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
    <div className="flex min-w-0 flex-col-reverse gap-3 md:flex-row">
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
            <Image
              src={getListingImageUrl(image.url)}
              alt=""
              fill
              sizes="64px"
              quality={60}
              className="object-cover"
            />
          </button>
        ))}
      </div>

      <div
        ref={trackRef}
        onScroll={handleScroll}
        className="flex aspect-[4/5] w-full min-w-0 snap-x md:w-auto md:flex-1 snap-mandatory overflow-x-auto"
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
            <button
              type="button"
              aria-label={`View full-size image ${i + 1} of ${productName}`}
              className="absolute inset-0"
              onClick={() => {
                setIndex(i);
                setViewFullSize(true);
              }}
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute bottom-3 right-3 inline-flex items-center gap-2 bg-pitch-dark/80 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-white"
            >
              <Maximize2 className="h-3.5 w-3.5" /> View full size
            </span>
          </div>
        ))}
      </div>
      <Dialog open={viewFullSize} onOpenChange={setViewFullSize}>
        <DialogContent className="h-[100dvh] w-screen max-w-none border-0 bg-black p-0 text-white sm:rounded-none">
          <DialogTitle className="sr-only">
            {productName} — full-size image
          </DialogTitle>
          {ordered[index] && (
            <div className="relative h-full w-full">
              <Image
                src={ordered[index].url}
                alt={`${productName} — full-size view ${index + 1}`}
                fill
                sizes="100vw"
                unoptimized
                className="object-contain"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
