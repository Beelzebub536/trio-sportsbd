import { z } from "zod";

export const bannerSchema = z.object({
  title: z.string().trim().min(2, "Enter a title"),
  subtitle: z.string().trim().max(160, "Subtitle is too long").nullable().optional(),
  imageUrl: z.string().trim().url("Enter a valid image URL"),
  linkUrl: z.string().trim().min(1, "Enter a link"),
  sortOrder: z.number().int().min(0).max(99),
  isActive: z.boolean(),
});

export type BannerValues = z.infer<typeof bannerSchema>;
