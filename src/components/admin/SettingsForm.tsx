"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { saveSettings } from "@/actions/admin/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { StoreSettings } from "@/lib/settings";

const TEXT_FIELDS: Array<{
  key: keyof StoreSettings;
  label: string;
  hint?: string;
}> = [
  { key: "storeName", label: "Store name" },
  { key: "storeAddress", label: "Store address" },
  { key: "supportHours", label: "Support hours" },
  { key: "whatsappNumber", label: "WhatsApp number", hint: "Include the country code, e.g. 8801700000000" },
  { key: "bkashNumber", label: "bKash number" },
  { key: "nagadNumber", label: "Nagad number" },
];

const NUMBER_FIELDS: Array<{
  key: keyof StoreSettings;
  label: string;
  hint?: string;
}> = [
  { key: "advancePercent", label: "Advance payment (%)", hint: "Typical: 10" },
  { key: "shippingInsideDhaka", label: "Delivery inside Dhaka (৳)" },
  { key: "shippingOutsideDhaka", label: "Delivery outside Dhaka (৳)" },
  {
    key: "freeShippingThreshold",
    label: "Free delivery over (৳)",
    hint: "Use 0 to disable free delivery",
  },
];

export default function SettingsForm({
  settings,
}: {
  settings: StoreSettings;
}) {
  const router = useRouter();
  const [form, setForm] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      Object.entries(settings).map(([key, value]) => [key, String(value)]),
    ),
  );
  const [busy, setBusy] = useState(false);

  const set = (key: string, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);

    const payload = {
      storeName: form.storeName ?? "",
      storeAddress: form.storeAddress ?? "",
      supportHours: form.supportHours ?? "",
      whatsappNumber: form.whatsappNumber ?? "",
      bkashNumber: form.bkashNumber ?? "",
      nagadNumber: form.nagadNumber ?? "",
      advancePercent: Math.max(0, Number(form.advancePercent) || 0),
      onlinePaymentsEnabled: form.onlinePaymentsEnabled === "true",
      shippingInsideDhaka: Math.max(0, Number(form.shippingInsideDhaka) || 0),
      shippingOutsideDhaka: Math.max(0, Number(form.shippingOutsideDhaka) || 0),
      freeShippingThreshold: Math.max(
        0,
        Number(form.freeShippingThreshold) || 0,
      ),
    };

    const result = await saveSettings(payload);
    setBusy(false);

    if (!result.ok) {
      toast.error(result.error ?? "Could not save the settings.");
      return;
    }
    toast.success("Settings saved");
    router.refresh();
  };

  return (
    <form onSubmit={submit} className="space-y-6" noValidate>
      <section className="grid gap-4 border border-border p-4 sm:grid-cols-2">
        <h2 className="text-sm font-bold uppercase tracking-widest sm:col-span-2">
          Store details
        </h2>
        {TEXT_FIELDS.map((field) => (
          <div key={field.key} className="space-y-2">
            <Label htmlFor={`s-${field.key}`}>{field.label}</Label>
            <Input
              id={`s-${field.key}`}
              value={form[field.key] ?? ""}
              onChange={(event) => set(field.key, event.target.value)}
            />
            {field.hint && (
              <p className="text-xs text-muted-foreground">{field.hint}</p>
            )}
          </div>
        ))}
      </section>

      <section className="space-y-3 border border-border p-4">
        <h2 className="text-sm font-bold uppercase tracking-widest">
          Checkout payment
        </h2>
        <label className="flex items-center gap-3 text-sm">
          <Switch
            checked={form.onlinePaymentsEnabled === "true"}
            onCheckedChange={(enabled) =>
              set("onlinePaymentsEnabled", String(enabled))
            }
          />
          Accept online payments
        </label>
        <p className="text-xs text-muted-foreground">
          When off, customers submit an order request and confirm it with you on
          WhatsApp. When on, they can choose a full payment or the configured
          advance and submit transaction details for manual verification. Enable
          this only after your bKash/Nagad account is approved to accept business
          payments.
        </p>
      </section>

      <section className="grid gap-4 border border-border p-4 sm:grid-cols-2">
        <h2 className="text-sm font-bold uppercase tracking-widest sm:col-span-2">
          Payments &amp; delivery
        </h2>
        {NUMBER_FIELDS.map((field) => (
          <div key={field.key} className="space-y-2">
            <Label htmlFor={`s-${field.key}`}>{field.label}</Label>
            <Input
              id={`s-${field.key}`}
              type="number"
              min={0}
              value={form[field.key] ?? ""}
              onChange={(event) => set(field.key, event.target.value)}
            />
            {field.hint && (
              <p className="text-xs text-muted-foreground">{field.hint}</p>
            )}
          </div>
        ))}
      </section>

      <Button type="submit" disabled={busy}>
        {busy ? "Saving…" : "Save settings"}
      </Button>
    </form>
  );
}
