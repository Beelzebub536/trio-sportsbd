import { z } from "zod";

export const priceEditSchema = z
  .object({
    id: z.number().int().positive(),
    basePrice: z.number().int().positive().max(1000000),
    salePrice: z.number().int().positive().max(1000000).nullable(),
  })
  .refine(
    (value) => value.salePrice == null || value.salePrice < value.basePrice,
    { message: "Sale price must be below the base price", path: ["salePrice"] },
  );

export const priceBatchSchema = z.object({
  label: z.string().trim().min(2, "Give this batch a label").max(80),
  edits: z
    .array(priceEditSchema)
    .min(1, "There are no changes to save")
    .max(500, "Too many rows in one batch"),
});

