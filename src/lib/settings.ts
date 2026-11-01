import { cache } from "react";
import { unstable_cache } from "next/cache";

import prisma from "@/lib/prisma";

/** Store settings stored as key/value JSON in the `Setting` table. */
export type StoreSettings = {
  storeName: string;
  storeAddress: string;
  supportHours: string;
  whatsappNumber: string;
  bkashNumber: string;
  nagadNumber: string;
  advancePercent: number;
  onlinePaymentsEnabled: boolean;
  shippingInsideDhaka: number;
  shippingOutsideDhaka: number;
  freeShippingThreshold: number;
};

export const SETTINGS_TAG = "store-settings";

export const defaultSettings: StoreSettings = {
  storeName: "Trio Sports BD",
  storeAddress: "Dhaka, Bangladesh",
  supportHours: "Sat–Thu, 10:00am – 8:00pm",
  whatsappNumber: "8801700000000",
  bkashNumber: "",
  nagadNumber: "",
  advancePercent: 10,
  onlinePaymentsEnabled: false,
  shippingInsideDhaka: 60,
  shippingOutsideDhaka: 120,
  freeShippingThreshold: 5000,
};

const asString = (value: unknown, fallback: string): string =>
  typeof value === "string" && value.trim().length > 0 ? value : fallback;

const asNumber = (value: unknown, fallback: number): number => {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

/** Read all settings, merged over the defaults. Cached and tagged `SETTINGS_TAG`. */
const getCachedSettings = unstable_cache(
  async (): Promise<StoreSettings> => {
    const rows: Array<{ key: string; value: unknown }> = await prisma.setting.findMany();

    const map = new Map(rows.map((row) => [row.key, row.value]));

    return {
      storeName: asString(map.get("storeName"), defaultSettings.storeName),
      storeAddress: asString(map.get("storeAddress"), defaultSettings.storeAddress),
      supportHours: asString(map.get("supportHours"), defaultSettings.supportHours),
      whatsappNumber: asString(
        map.get("whatsappNumber"),
        defaultSettings.whatsappNumber,
      ),
      bkashNumber:
        typeof map.get("bkashNumber") === "string"
          ? (map.get("bkashNumber") as string)
          : defaultSettings.bkashNumber,
      nagadNumber:
        typeof map.get("nagadNumber") === "string"
          ? (map.get("nagadNumber") as string)
          : defaultSettings.nagadNumber,
      advancePercent: asNumber(
        map.get("advancePercent"),
        defaultSettings.advancePercent,
      ),
      onlinePaymentsEnabled:
        typeof map.get("onlinePaymentsEnabled") === "boolean"
          ? (map.get("onlinePaymentsEnabled") as boolean)
          : defaultSettings.onlinePaymentsEnabled,
      shippingInsideDhaka: asNumber(
        map.get("shippingInsideDhaka"),
        defaultSettings.shippingInsideDhaka,
      ),
      shippingOutsideDhaka: asNumber(
        map.get("shippingOutsideDhaka"),
        defaultSettings.shippingOutsideDhaka,
      ),
      freeShippingThreshold: asNumber(
        map.get("freeShippingThreshold"),
        defaultSettings.freeShippingThreshold,
      ),
    };
  },
  ["store-settings"],
  { tags: [SETTINGS_TAG], revalidate: 300 },
);

// Coalesce simultaneous reads in one React render as well as using the
// persistent Next.js data cache to avoid duplicate cold-cache DB queries.
// The storefront still renders if the DB is unreachable; the fallback is outside the cache so
// defaults (e.g. shipping fees) are never cached in place of the real settings.
export const getSettings = cache(async (): Promise<StoreSettings> => {
  try {
    return await getCachedSettings();
  } catch {
    return defaultSettings;
  }
});
