import prisma from "@/lib/prisma";

export type BannerData = {
  id: number;
  title: string;
  subtitle: string | null;
  imageUrl: string;
  linkUrl: string;
};

export async function getActiveBanners(): Promise<BannerData[]> {
  try {
    return await prisma.banner.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        title: true,
        subtitle: true,
        imageUrl: true,
        linkUrl: true,
      },
    });
  } catch {
    return [];
  }
}
