import { z } from "zod";

export const settingsSchema = z.object({
  storeName: z.string().trim().min(2, "Enter the store name"),
  storeAddress: z.string().trim().min(2, "Enter the store address"),
  supportHours: z.string().trim().min(2, "Enter the support hours"),
  whatsappNumber: z.string().trim().min(6, "Enter the WhatsApp number"),
  bkashNumber: z.string().trim().max(32),
  nagadNumber: z.string().trim().max(32),
  advancePercent: z.number().int().min(1).max(100),
  onlinePaymentsEnabled: z.boolean(),
  shippingInsideDhaka: z.number().int().min(0).max(10000),
  shippingOutsideDhaka: z.number().int().min(0).max(10000),
  freeShippingThreshold: z.number().int().min(0).max(1000000),
}).superRefine((values, context) => {
  const placeholder = "01700000000";
  if (
    values.onlinePaymentsEnabled &&
    (!values.bkashNumber || values.bkashNumber === placeholder) &&
    (!values.nagadNumber || values.nagadNumber === placeholder)
  ) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["onlinePaymentsEnabled"],
      message: "Add a real payment account number before enabling online payment.",
    });
  }
});

export type SettingsValues = z.infer<typeof settingsSchema>;
