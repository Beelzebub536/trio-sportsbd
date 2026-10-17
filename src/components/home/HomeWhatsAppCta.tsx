import WhatsAppCta from "@/components/home/WhatsAppCta";
import { getSettings } from "@/lib/settings";

export default async function HomeWhatsAppCta() {
  const settings = await getSettings();
  return (
    <WhatsAppCta
      whatsappNumber={settings.whatsappNumber}
      supportHours={settings.supportHours}
    />
  );
}
