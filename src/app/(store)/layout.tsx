import Logo from "@/components/brand/Logo";

export default function StoreLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Placeholder header. Replaced by the announcement bar + sticky header + mega menu in Phase 3.1. */}
      <header className="bg-white p-4 shadow-sm md:p-6">
        <Logo />
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
