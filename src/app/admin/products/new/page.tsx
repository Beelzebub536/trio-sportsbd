import ProductForm from "@/components/admin/ProductForm";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";

export default async function NewProductPage() {
  await requireAdmin();

  const categories = await prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: { id: true, name: true },
  });

  return <ProductForm categories={categories} />;
}
