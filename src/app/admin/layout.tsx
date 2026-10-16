import Link from "next/link";

import AdminNav from "@/components/admin/AdminNav";
import { requireAdmin } from "@/lib/session";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdmin();

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-black text-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-3">
          <Link
            href="/admin"
            className="text-sm font-bold uppercase tracking-widest"
          >
            Trio Sports BD — Admin
          </Link>
          <div className="flex items-center gap-4 text-xs">
            <Link
              href="/"
              className="underline underline-offset-2 hover:no-underline"
            >
              View store
            </Link>
            <span className="text-white/60">{session.user.name}</span>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-6 lg:grid-cols-[200px_1fr]">
        <AdminNav />
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
