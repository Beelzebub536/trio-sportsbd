import Image from "next/image";
import Link from "next/link";

import { PHOTOS } from "@/lib/photos";

export default function SaleStrip() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 md:py-16">
      <div className="relative isolate overflow-hidden rounded-3xl">
        <Image
          src={PHOTOS.sale.src}
          alt=""
          fill
          sizes="(max-width: 1280px) 100vw, 1280px"
          quality={60}
          className="-z-20 object-cover object-[50%_35%]"
        />
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[linear-gradient(100deg,hsl(var(--background)/0.92)_15%,hsl(var(--destructive)/0.45)_100%)]"
        />
        <div className="flex flex-col items-start gap-6 px-6 py-14 md:flex-row md:items-end md:justify-between md:px-12 md:py-20">
          <div>
            <p className="inline-flex rounded-full bg-sale px-3 py-1 text-sm font-semibold text-white">
              Limited time
            </p>
            <h2 className="mt-4 text-5xl text-white md:text-7xl">Up to 30% off</h2>
            <p className="mt-3 max-w-md text-base text-white/80">
              Selected jerseys, track pants and accessories, while stocks last.
            </p>
          </div>
          <Link
            href="/sale"
            className="press inline-flex h-14 items-center rounded-full bg-white px-8 text-base font-semibold text-background hover:bg-white/90"
          >
            Shop the sale
          </Link>
        </div>
      </div>
    </section>
  );
}
