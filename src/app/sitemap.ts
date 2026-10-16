import type { MetadataRoute } from "next";

import prisma from "@/lib/prisma";
import { absoluteUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";

const STATIC_ROUTES: Array<{ path: string; priority: number }> = [
  { path: "/", priority: 1 },
  { path: "/shop", priority: 0.9 },
  { path: "/sale", priority: 0.9 },
  { path: "/men", priority: 0.8 },
  { path: "/women", priority: 0.8 },
  { path: "/kids", priority: 0.8 },
  { path: "/jerseys", priority: 0.8 },
  { path: "/trousers", priority: 0.8 },
  { path: "/accessories", priority: 0.8 },
  { path: "/size-guide", priority: 0.5 },
  { path: "/about", priority: 0.4 },
  { path: "/contact", priority: 0.4 },
  { path: "/shipping-returns", priority: 0.4 },
  { path: "/privacy", priority: 0.3 },
  { path: "/terms", priority: 0.3 },
  { path: "/data-deletion", priority: 0.2 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  let products: Array<{ slug: string; updatedAt: Date }> = [];
  let categories: Array<{ slug: string }> = [];

  try {
    [products, categories] = await Promise.all([
      prisma.product.findMany({
        where: { isActive: true },
        orderBy: { updatedAt: "desc" },
        take: 5000,
        select: { slug: true, updatedAt: true },
      }),
      prisma.category.findMany({
        orderBy: { sortOrder: "asc" },
        select: { slug: true },
      }),
    ]);
  } catch {
    // A build without a database should still emit the static routes.
  }

  return [
    ...STATIC_ROUTES.map((route) => ({
      url: absoluteUrl(route.path),
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: route.priority,
    })),
    ...categories.map((category) => ({
      url: absoluteUrl(`/shop?category=${category.slug}`),
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
    ...products.map((product) => ({
      url: absoluteUrl(`/product/${product.slug}`),
      lastModified: product.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
