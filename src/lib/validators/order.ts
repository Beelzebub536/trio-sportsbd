import { z } from "zod";

import { bdDivisions } from "@/lib/bd-locations";

export const BD_PHONE_REGEX = /^01[3-9]\d{8}$/;

export const cartItemSchema = z.object({
  variantId: z.number().int().positive(),
  qty: z.number().int().min(1).max(20),
});

export const checkoutSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name"),
  phone: z
    .string()
    .trim()
    .regex(BD_PHONE_REGEX, "Enter a valid Bangladeshi mobile number (01XXXXXXXXX)"),
  division: z
    .string()
    .min(1, "Select a division")
    .refine(
      (value) => bdDivisions.some((division) => division.name === value),
      "Select a valid division",
    ),
  district: z.string().trim().min(1, "Select a district"),
  upazila: z.string().trim().min(2, "Enter your upazila / thana"),
  address: z.string().trim().min(6, "Enter your full address"),
  note: z.string().trim().max(500, "Note is too long").optional().or(z.literal("")),
  advanceMethod: z.enum(["BKASH", "NAGAD"]),
  advanceTrxId: z
    .string()
    .trim()
    .regex(
      /^[A-Za-z0-9]{6,20}$/,
      "Transaction ID must be 6–20 letters or numbers",
    ),
  advanceSenderNumber: z
    .string()
    .trim()
    .regex(BD_PHONE_REGEX, "Enter the number you sent the money from"),
  terms: z.boolean().refine((value) => value === true, {
    message: "Please accept the terms and conditions",
  }),
  items: z
    .array(cartItemSchema)
    .min(1, "Your bag is empty")
    .max(50, "Too many items in one order")
    .superRefine((items, context) => {
      const seen = new Set<number>();
      items.forEach((item, index) => {
        if (seen.has(item.variantId)) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Each product option can only appear once.",
            path: [index, "variantId"],
          });
        }
        seen.add(item.variantId);
      });
    }),
});

/** The checkout form fields only — `items` come from the cart store. */
export const checkoutFormSchema = checkoutSchema.omit({ items: true });

export type CheckoutValues = z.infer<typeof checkoutSchema>;
export type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;
export type CartItemInput = z.infer<typeof cartItemSchema>;
