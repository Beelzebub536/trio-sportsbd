import CategoryManager, {
  type CategoryRecord,
} from "@/components/admin/CategoryManager";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";

export default async function AdminCategoriesPage() {
  await requireAdmin();

  const categories = await prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      slug: true,
      parentId: true,
      image: true,
      sortOrder: true,
      _count: { select: { products: true } },
    },
  });

  const records: CategoryRecord[] = categories.map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    parentId: category.parentId,
    image: category.image,
    sortOrder: category.sortOrder,
    productCount: category._count.products,
  }));

  return <CategoryManager categories={records} />;
}
