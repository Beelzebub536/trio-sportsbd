import Link from "next/link";

export default function SaleStrip() {
  return (
    <section className="relative isolate overflow-hidden bg-sale text-white">
      <span
        aria-hidden
        className="pointer-events-none absolute -right-4 top-1/2 -z-10 -translate-y-1/2 select-none font-display text-[14rem] font-extrabold leading-none text-transparent [-webkit-text-stroke:2px_hsl(0_0%_100%/0.25)] md:text-[22rem]"
      >
        %
      </span>
      <div className="mx-auto flex max-w-7xl flex-col items-start gap-6 px-4 py-14 md:flex-row md:items-end md:justify-between md:py-20">
        <div>
          <h2 className="text-6xl md:text-8xl">Up to 30% off</h2>
          <p className="mt-3 max-w-md text-base text-white">
            Selected jerseys, track pants and accessories, while stocks last.
          </p>
        </div>
        <Link
          href="/sale"
          className="press inline-flex h-14 items-center bg-white px-8 text-sm font-bold uppercase tracking-wide text-sale hover:bg-white/90"
        >
          Shop the sale
        </Link>
      </div>
    </section>
  );
}
