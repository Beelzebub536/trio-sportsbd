import SettingsForm from "@/components/admin/SettingsForm";
import { requireAdmin } from "@/lib/session";
import { getSettings } from "@/lib/settings";

export default async function AdminSettingsPage() {
  await requireAdmin();
  const settings = await getSettings();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold uppercase leading-none md:text-3xl">
        Store settings
      </h1>
      <p className="max-w-2xl text-sm text-muted-foreground">
        These values power delivery charges, the advance payment amount and the
        WhatsApp buttons across the storefront.
      </p>
      <SettingsForm settings={settings} />
    </div>
  );
}
