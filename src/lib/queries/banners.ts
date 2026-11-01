import { unstable_cache } from "next/cache";

import prisma from "@/lib/prisma";
import { BANNERS_TAG } from "@/lib/cache-tags";

export type BannerData = {
  id: number;
  title: string;
  subtitle: string | null;
  imageUrl: string;
  linkUrl: string;
};

const getCachedActiveBanners = unstable_cache(
  async (): Promise<BannerData[]> =>
    prisma.banner.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        title: true,
        subtitle: true,
        imageUrl: true,
        linkUrl: true,
      },
    }),
  ["active-banners-v1"],
  { tags: [BANNERS_TAG], revalidate: 300 },
);

export async function getActiveBanners(): Promise<BannerData[]> {
  // Fall back outside the cache so a transient DB error is never cached as "no banners".
  try {
    return await getCachedActiveBanners();
  } catch {
    return [];
  }
}
