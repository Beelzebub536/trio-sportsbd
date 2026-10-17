import WishlistSync from "@/components/account/WishlistSync";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import SiteHeader from "@/components/layout/SiteHeader";
import { getCategoryTree } from "@/lib/queries/categories";
import { getSession } from "@/lib/session";
import { getSettings } from "@/lib/settings";

export default async function StoreChrome() {
  const [categories, session, settings] = await Promise.all([
    getCategoryTree(),
    getSession(),
    getSettings(),
  ]);

  const user = session?.user
    ? { name: session.user.name, role: session.user.role ?? null }
    : null;

  return (
    <>
      <AnnouncementBar
        freeShippingThreshold={settings.freeShippingThreshold}
        whatsappNumber={settings.whatsappNumber}
      />
      <SiteHeader
        categories={categories}
        user={user}
        freeShippingThreshold={settings.freeShippingThreshold}
      />
      {user && <WishlistSync />}
    </>
  );
}
