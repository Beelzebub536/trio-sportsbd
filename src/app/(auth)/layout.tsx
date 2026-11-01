import Link from "next/link";

import Logo from "@/components/brand/Logo";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      {/* Desktop-only brand panel; pure CSS so the sign-in page makes no extra image request. */}
      <aside className="floodlight relative hidden overflow-hidden text-white lg:block">
        <span
          aria-hidden
          className="pointer-events-none absolute -bottom-16 -right-10 select-none font-display text-[30rem] font-extrabold leading-none text-transparent [-webkit-text-stroke:2px_hsl(0_0%_100%/0.18)]"
        >
          10
        </span>
        <div className="relative flex h-full flex-col justify-between p-12">
          <Link href="/" className="w-fit text-white hover:opacity-90">
            <Logo className="text-3xl [&>span]:text-white/70" />
          </Link>
          <div>
            <h2 className="text-7xl xl:text-8xl">Built for the game</h2>
            <p className="mt-5 max-w-sm text-lg text-white/80">
              Jerseys, trousers and accessories for players and fans across Bangladesh, with order
              confirmation on WhatsApp.
            </p>
          </div>
        </div>
      </aside>

      <main className="flex flex-col p-6 md:p-10">
        <Link href="/" className="w-fit lg:hidden" aria-label="Trio Sports BD home">
          <Logo />
        </Link>
        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </main>
    </div>
  );
}
