import { z } from "zod";

import { bdDivisions } from "@/lib/bd-locations";
import { BD_PHONE_REGEX } from "@/lib/validators/order";

export const addressSchema = z.object({
  fullName: z.string().trim().min(2, "Enter the full name"),
  phone: z.string().trim().regex(BD_PHONE_REGEX, "Enter a valid mobile number"),
  division: z
    .string()
    .min(1, "Select a division")
    .refine(
      (value) => bdDivisions.some((division) => division.name === value),
      "Select a valid division",
    ),
  district: z.string().trim().min(1, "Select a district"),
  upazila: z.string().trim().min(2, "Enter the upazila / thana"),
  line1: z.string().trim().min(6, "Enter the full address"),
  isDefault: z.boolean().optional(),
});

export type AddressValues = z.infer<typeof addressSchema>;
