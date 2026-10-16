import BannerManager, {
  type BannerRecord,
} from "@/components/admin/BannerManager";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";

export default async function AdminBannersPage() {
  await requireAdmin();

  const banners: BannerRecord[] = await prisma.banner.findMany({
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      title: true,
      subtitle: true,
      imageUrl: true,
      linkUrl: true,
      sortOrder: true,
      isActive: true,
    },
  });

  return <BannerManager banners={banners} />;
}
