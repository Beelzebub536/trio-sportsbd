import PriceEditor from "@/components/admin/PriceEditor";
import type { EditorProduct } from "@/lib/prices";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";

export default async function AdminPricesPage() {
  await requireAdmin();

  const products = await prisma.product.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      gender: true,
      brand: true,
      basePrice: true,
      salePrice: true,
      isActive: true,
      category: { select: { name: true } },
      images: { orderBy: { sortOrder: "asc" }, take: 1, select: { url: true } },
      variants: { select: { sku: true } },
    },
  });

  const editorProducts: EditorProduct[] = products.map((product) => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    categoryName: product.category.name,
    gender: product.gender,
    brand: product.brand,
    image: product.images[0]?.url ?? null,
    basePrice: product.basePrice,
    salePrice: product.salePrice,
    isActive: product.isActive,
    skus: product.variants.map((variant) => variant.sku),
  }));

  return <PriceEditor products={editorProducts} />;
}
