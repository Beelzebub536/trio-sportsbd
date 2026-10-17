import Footer from "@/components/layout/Footer";
import { getSettings } from "@/lib/settings";

export default async function StoreFooter() {
  const settings = await getSettings();
  return <Footer settings={settings} />;
}
