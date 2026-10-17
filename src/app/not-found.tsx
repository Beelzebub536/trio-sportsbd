import { Suspense } from "react";

import Footer from "@/components/layout/Footer";
import NotFoundContent from "@/components/layout/NotFoundContent";
import StoreChrome from "@/components/layout/StoreChrome";
import StoreChromeFallback from "@/components/layout/StoreChromeFallback";
import StoreFooter from "@/components/layout/StoreFooter";
import { defaultSettings } from "@/lib/settings";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <Suspense fallback={<StoreChromeFallback />}>
        <StoreChrome />
      </Suspense>
      <main className="flex-1">
        <NotFoundContent />
      </main>
      <Suspense fallback={<Footer settings={defaultSettings} />}>
        <StoreFooter />
      </Suspense>
    </div>
  );
}
