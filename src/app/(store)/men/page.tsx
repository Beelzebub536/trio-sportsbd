import type { Metadata } from "next";

import ProductListing from "@/components/product/ProductListing";
import type { RawSearchParams } from "@/lib/listing-params";

export const metadata: Metadata = {
  title: "Men",
  description: "Men's jerseys, track pants, shorts and accessories.",
};

export default async function MenPage({
  searchParams,
}: {
  searchParams: RawSearchParams;
}) {
  const params = await searchParams;

  return (
    <ProductListing
      basePath="/men"
      params={params}
      fixed={{ genders: ["MEN"] }}
      title="Men"
      description="Match-day jerseys, training trousers and accessories for men."
    />
  );
}
