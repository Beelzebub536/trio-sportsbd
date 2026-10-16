import WishlistSync from "@/components/account/WishlistSync";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import Footer from "@/components/layout/Footer";
import SiteHeader from "@/components/layout/SiteHeader";
import { getCategoryTree } from "@/lib/queries/categories";
import { getSession } from "@/lib/session";
import { getSettings } from "@/lib/settings";

// The storefront shell depends on the database (categories, settings) and the
// session, so it is rendered dynamically rather than prerendered at build time.
export const dynamic = "force-dynamic";

export default async function StoreLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [categories, session, settings] = await Promise.all([
    getCategoryTree(),
    getSession(),
    getSettings(),
  ]);

  const user = session?.user
    ? { name: session.user.name, role: session.user.role ?? null }
    : null;

  return (
    <div className="flex min-h-screen flex-col">
      <AnnouncementBar
        freeShippingThreshold={settings.freeShippingThreshold}
        whatsappNumber={settings.whatsappNumber}
      />
      <SiteHeader
        categories={categories}
        user={user}
        freeShippingThreshold={settings.freeShippingThreshold}
      />
      <main className="flex-1">{children}</main>
      <Footer settings={settings} />
      {user && <WishlistSync />}
    </div>
  );
}
