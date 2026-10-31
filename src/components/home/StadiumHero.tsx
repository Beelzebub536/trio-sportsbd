import Link from "next/link";

/** Static brand hero: no data fetch, so it is the instant first paint while sections stream. */
export default function StadiumHero() {
  return (
    <section className="pitch-stripes relative isolate overflow-hidden text-white">
      <PitchLines />

      <span
        aria-hidden
        className="hero-in pointer-events-none absolute -right-6 bottom-[-0.12em] -z-10 select-none font-display text-[clamp(16rem,58vw,36rem)] font-extrabold leading-none text-transparent [-webkit-text-stroke:2px_hsl(0_0%_100%/0.22)] [animation-delay:150ms]"
      >
        10
      </span>

      <div className="hero-in relative mx-auto flex min-h-[min(78svh,640px)] max-w-7xl flex-col justify-end px-4 pb-12 pt-24 lg:min-h-[600px] lg:justify-center lg:pb-20">
        <h1 className="max-w-[11ch] text-[clamp(3.75rem,15vw,8.5rem)] font-extrabold leading-[0.82]">
          Match day starts here
        </h1>
        <p className="mt-5 max-w-md text-base text-white/85 md:text-lg">
          Jerseys, trousers and training kit for players and fans across Bangladesh. Pay cash on
          delivery.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/jerseys"
            className="press inline-flex h-14 items-center bg-white px-7 text-sm font-bold uppercase tracking-wide text-pitch-dark hover:bg-white/90"
          >
            Shop jerseys
          </Link>
          <Link
            href="/sale"
            className="press inline-flex h-14 items-center border-2 border-white px-7 text-sm font-bold uppercase tracking-wide hover:bg-white hover:text-pitch-dark"
          >
            See the sale
          </Link>
        </div>
      </div>
    </section>
  );
}

/** Football pitch markings drawn as one lightweight inline SVG. */
function PitchLines() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 1200 700"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 -z-10 h-full w-full"
      fill="none"
      stroke="hsl(0 0% 100% / 0.16)"
      strokeWidth="3"
    >
      <rect x="40" y="40" width="1120" height="620" vectorEffect="non-scaling-stroke" />
      <line x1="600" y1="40" x2="600" y2="660" vectorEffect="non-scaling-stroke" />
      <circle cx="600" cy="350" r="100" vectorEffect="non-scaling-stroke" />
      <circle cx="600" cy="350" r="5" fill="hsl(0 0% 100% / 0.3)" />
      <rect x="40" y="190" width="170" height="320" vectorEffect="non-scaling-stroke" />
      <rect x="40" y="270" width="60" height="160" vectorEffect="non-scaling-stroke" />
      <rect x="990" y="190" width="170" height="320" vectorEffect="non-scaling-stroke" />
      <rect x="1100" y="270" width="60" height="160" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
