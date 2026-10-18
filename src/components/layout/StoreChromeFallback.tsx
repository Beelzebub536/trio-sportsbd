import AnnouncementBar from "@/components/layout/AnnouncementBar";
import SiteHeader from "@/components/layout/SiteHeader";
import { defaultSettings } from "@/lib/settings";

export default function StoreChromeFallback() {
  return (
    <>
      <AnnouncementBar
        freeShippingThreshold={defaultSettings.freeShippingThreshold}
        whatsappNumber={defaultSettings.whatsappNumber}
        onlinePaymentsEnabled={defaultSettings.onlinePaymentsEnabled}
      />
      <SiteHeader
        categories={[]}
        user={null}
        freeShippingThreshold={defaultSettings.freeShippingThreshold}
      />
    </>
  );
}
