import { Suspense } from "react";

import StoreChrome from "@/components/layout/StoreChrome";
import StoreChromeFallback from "@/components/layout/StoreChromeFallback";
import StoreFooter from "@/components/layout/StoreFooter";
import Footer from "@/components/layout/Footer";
import { defaultSettings } from "@/lib/settings";

// The storefront shell depends on the database (categories, settings) and the
// session, so it is rendered dynamically rather than prerendered at build time.
export const dynamic = "force-dynamic";

export default function StoreLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col">
      <Suspense fallback={<StoreChromeFallback />}>
        <StoreChrome />
      </Suspense>
      <main className="flex-1">{children}</main>
      <Suspense fallback={<Footer settings={defaultSettings} />}>
        <StoreFooter />
      </Suspense>
    </div>
  );
}
