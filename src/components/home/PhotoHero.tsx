import Image from "next/image";
import Link from "next/link";

import { PHOTOS } from "@/lib/photos";

/** Static hero: no data fetch, so it paints immediately while the sections below stream in. */
export default function PhotoHero() {
  return (
    <section className="relative isolate flex min-h-[min(88svh,760px)] items-end overflow-hidden">
      <Image
        src={PHOTOS.hero.src}
        alt={PHOTOS.hero.alt}
        fill
        priority
        sizes="100vw"
        quality={60}
        className="-z-20 object-cover object-[60%_40%]"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[linear-gradient(to_top,hsl(var(--background))_2%,hsl(var(--background)/0.55)_45%,hsl(var(--background)/0.1)_100%)] lg:bg-[linear-gradient(to_right,hsl(var(--background)/0.92)_10%,hsl(var(--background)/0.35)_60%,transparent)]"
      />

      <div className="hero-in mx-auto w-full max-w-7xl px-4 pb-14 pt-32 lg:pb-24">
        <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-sm text-white/85">
          <span aria-hidden className="h-2 w-2 rounded-full bg-primary" />
          New season kits are in
        </p>
        <h1 className="mt-5 max-w-[12ch] text-[clamp(3rem,11vw,6.75rem)] leading-[0.92] text-white">
          Made for match day.
        </h1>
        <p className="mt-5 max-w-md text-base text-white/75 md:text-lg">
          Jerseys, training wear and kit for players and fans across Bangladesh. Cash on delivery,
          nationwide.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/jerseys"
            className="press inline-flex h-14 items-center rounded-full bg-primary px-8 text-base font-semibold text-primary-foreground hover:brightness-110"
          >
            Shop jerseys
          </Link>
          <Link
            href="/sale"
            className="press inline-flex h-14 items-center rounded-full border border-white/25 bg-white/5 px-8 text-base font-semibold text-white hover:bg-white/10"
          >
            Browse the sale
          </Link>
        </div>
      </div>
    </section>
  );
}
