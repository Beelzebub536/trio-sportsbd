import { notFound } from "next/navigation";

import ProductForm from "@/components/admin/ProductForm";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();

  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();

  const [categories, product] = await Promise.all([
    prisma.category.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: { id: true, name: true },
    }),
    prisma.product.findUnique({
      where: { id },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        variants: { orderBy: [{ size: "asc" }, { color: "asc" }] },
      },
    }),
  ]);

  if (!product) notFound();

  return (
    <ProductForm
      categories={categories}
      product={{
        id: product.id,
        name: product.name,
        slug: product.slug,
        description: product.description,
        brand: product.brand,
        gender: product.gender,
        categoryId: product.categoryId,
        basePrice: product.basePrice,
        salePrice: product.salePrice,
        isActive: product.isActive,
        isFeatured: product.isFeatured,
        images: product.images.map((image) => ({
          url: image.url,
          publicId: image.publicId,
          color: image.color,
        })),
        variants: product.variants.map((variant) => ({
          size: variant.size,
          color: variant.color,
          colorHex: variant.colorHex,
          stock: variant.stock,
        })),
      }}
    />
  );
}
