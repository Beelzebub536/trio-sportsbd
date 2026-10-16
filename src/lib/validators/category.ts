import { z } from "zod";

import { SLUG_REGEX } from "@/lib/validators/product";

export const categorySchema = z.object({
  name: z.string().trim().min(2, "Enter a category name"),
  slug: z.string().trim().regex(SLUG_REGEX, "Use lowercase letters, numbers and dashes"),
  parentId: z.number().int().positive().nullable().optional(),
  image: z.string().trim().url("Enter a valid image URL").nullable().optional(),
  sortOrder: z.number().int().min(0).max(999),
});

export type CategoryValues = z.infer<typeof categorySchema>;
