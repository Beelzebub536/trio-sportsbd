import ProductRow from "@/components/home/ProductRow";
import { getRelatedProducts } from "@/lib/queries/products";

export default async function RelatedProductsSection({
  productId,
  categoryId,
  categorySlug,
}: {
  productId: number;
  categoryId: number;
  categorySlug: string;
}) {
  const products = await getRelatedProducts(productId, categoryId, 4);
  if (products.length === 0) return null;

  return (
    <div className="mt-12 border-t border-border pt-4">
      <ProductRow
        title="You may also like"
        href={`/shop?category=${encodeURIComponent(categorySlug)}`}
        products={products}
      />
    </div>
  );
}
