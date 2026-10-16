import Image from "next/image";
import Link from "next/link";

import Logo from "@/components/brand/Logo";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Desktop-only black panel */}
      <aside className="relative hidden overflow-hidden bg-black text-white lg:block">
        <Image
          src="https://placehold.co/1200x1600/000000/ffffff/png?text=TRIO+SPORTS+BD"
          alt=""
          fill
          priority
          sizes="50vw"
          className="object-cover opacity-30"
        />
        <div className="relative z-10 flex h-full flex-col justify-between p-12">
          <Link
            href="/"
            className="text-sm font-bold uppercase tracking-[0.2em] text-white/80 hover:text-white"
          >
            Trio Sports BD
          </Link>
          <div>
            <div className="mb-6 h-1 w-16 bg-[var(--brand-accent)]" aria-hidden />
            <h2 className="text-5xl font-bold uppercase leading-[0.95] xl:text-6xl">
              Built for the game
            </h2>
            <p className="mt-5 max-w-sm text-white/70">
              Jerseys, trousers and accessories for athletes across Bangladesh.
              Cash on delivery with a 10% advance.
            </p>
          </div>
        </div>
      </aside>

      {/* Form column */}
      <main className="flex flex-col p-6 md:p-10">
        <div className="lg:hidden">
          <Logo />
        </div>
        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </main>
    </div>
  );
}
