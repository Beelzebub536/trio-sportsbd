import { z } from "zod";

export const settingsSchema = z.object({
  storeName: z.string().trim().min(2, "Enter the store name"),
  storeAddress: z.string().trim().min(2, "Enter the store address"),
  supportHours: z.string().trim().min(2, "Enter the support hours"),
  whatsappNumber: z.string().trim().min(6, "Enter the WhatsApp number"),
  bkashNumber: z.string().trim().min(6, "Enter the bKash number"),
  nagadNumber: z.string().trim().min(6, "Enter the Nagad number"),
  advancePercent: z.number().int().min(1).max(100),
  onlinePaymentsEnabled: z.boolean(),
  shippingInsideDhaka: z.number().int().min(0).max(10000),
  shippingOutsideDhaka: z.number().int().min(0).max(10000),
  freeShippingThreshold: z.number().int().min(0).max(1000000),
});

export type SettingsValues = z.infer<typeof settingsSchema>;
