import Image from "next/image";
import Link from "next/link";

import { PHOTOS } from "@/lib/photos";

export default function CricketPromo() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 md:py-16">
      <div className="grid overflow-hidden rounded-3xl bg-card md:grid-cols-2">
        <div className="relative aspect-[4/3] md:aspect-auto md:min-h-[420px]">
          <Image
            src={PHOTOS.cricket.src}
            alt={PHOTOS.cricket.alt}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            quality={60}
            className="object-cover"
          />
        </div>
        <div className="flex flex-col justify-center p-6 md:p-12">
          <h2 className="text-3xl md:text-5xl">Cricket season is on.</h2>
          <p className="mt-4 max-w-md text-base text-muted-foreground">
            Fan and player jerseys for Bangladesh cricket, built to breathe through long innings.
          </p>
          <Link
            href="/shop?category=cricket-jerseys"
            className="press mt-8 inline-flex h-12 w-fit items-center rounded-full bg-foreground px-7 text-sm font-semibold text-background hover:bg-foreground/90"
          >
            Shop cricket jerseys
          </Link>
        </div>
      </div>
    </section>
  );
}
