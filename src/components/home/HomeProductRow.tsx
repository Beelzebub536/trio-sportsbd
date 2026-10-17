import ProductRow from "@/components/home/ProductRow";
import {
  getFeaturedProducts,
  getNewArrivals,
  getSaleProducts,
} from "@/lib/queries/products";

type RowKind = "new" | "featured" | "sale";

export default async function HomeProductRow({
  kind,
  title,
  href,
}: {
  kind: RowKind;
  title: string;
  href: string;
}) {
  const products =
    kind === "new"
      ? await getNewArrivals(8)
      : kind === "featured"
        ? await getFeaturedProducts(8)
        : await getSaleProducts(8);

  return <ProductRow title={title} href={href} products={products} />;
}
