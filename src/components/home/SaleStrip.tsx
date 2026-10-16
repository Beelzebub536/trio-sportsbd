import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function SaleStrip() {
  return (
    <section className="bg-black text-white">
      <div className="mx-auto flex max-w-7xl flex-col items-start gap-4 px-4 py-10 md:flex-row md:items-center md:justify-between md:py-14">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-white/60">
            Limited time
          </p>
          <h2 className="mt-2 text-3xl font-bold uppercase leading-none md:text-5xl">
            Sale — up to 30% off
          </h2>
          <p className="mt-3 max-w-lg text-sm text-white/75">
            Selected jerseys, track pants and accessories. While stocks last.
          </p>
        </div>
        <Link
          href="/sale"
          className="inline-flex items-center gap-2 bg-[var(--brand-accent)] px-6 py-3 text-xs font-bold uppercase tracking-widest text-black transition-opacity hover:opacity-90"
        >
          Shop the sale <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
