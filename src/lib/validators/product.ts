import { z } from "zod";

export const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const HEX_REGEX = /^#[0-9a-fA-F]{6}$/;

export const productImageSchema = z.object({
  url: z.string().trim().url("Enter a valid image URL"),
  publicId: z.string().trim().nullable().optional(),
  color: z.string().trim().max(40).nullable().optional(),
  sortOrder: z.number().int().min(0).max(50),
});

export const productVariantSchema = z.object({
  size: z.string().trim().min(1, "Size is required").max(20),
  color: z.string().trim().min(1, "Colour is required").max(40),
  colorHex: z.string().trim().regex(HEX_REGEX, "Use a #rrggbb colour").nullable().optional(),
  stock: z.number().int().min(0).max(99999),
  sku: z.string().trim().max(80).nullable().optional(),
});

export const productSchema = z
  .object({
    name: z.string().trim().min(3, "Enter a product name"),
    slug: z.string().trim().regex(SLUG_REGEX, "Use lowercase letters, numbers and dashes"),
    description: z.string().trim().min(10, "Write a short description"),
    brand: z.string().trim().max(60).nullable().optional(),
    gender: z.enum(["MEN", "WOMEN", "KIDS", "UNISEX"]),
    categoryId: z.number().int().positive("Choose a category"),
    basePrice: z.number().int().min(0, "Base price cannot be negative").max(1000000),
    salePrice: z.number().int().min(0).max(1000000).nullable(),
    isActive: z.boolean(),
    isFeatured: z.boolean(),
    images: z.array(productImageSchema).max(12, "Maximum 12 images"),
    variants: z.array(productVariantSchema).min(1, "Add at least one size/colour variant"),
  })
  .refine(
    (value) => value.salePrice == null || value.salePrice < value.basePrice,
    { message: "Sale price must be lower than the base price", path: ["salePrice"] },
  );

export type ProductValues = z.infer<typeof productSchema>;
