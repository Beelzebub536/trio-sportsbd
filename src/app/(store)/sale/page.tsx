import type { Metadata } from "next";

import ProductListing from "@/components/product/ProductListing";
import type { RawSearchParams } from "@/lib/listing-params";

export const metadata: Metadata = {
  title: "Sale",
  description: "Discounted jerseys, trousers and accessories.",
  alternates: { canonical: "/sale" },
};

export default async function SalePage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const params = await searchParams;

  return (
    <ProductListing
      basePath="/sale"
      params={params}
      fixed={{ onSale: true }}
      title="Sale"
      description="Reduced prices on selected styles — while stocks last."
    />
  );
}
