import type { Metadata } from "next";

import ProductListing from "@/components/product/ProductListing";
import type { RawSearchParams } from "@/lib/listing-params";

export const metadata: Metadata = {
  title: "Women",
  description: "Women's sportswear: track pants, shorts and jerseys.",
  alternates: { canonical: "/women" },
};

export default async function WomenPage({
  searchParams,
}: {
  searchParams: RawSearchParams;
}) {
  const params = await searchParams;

  return (
    <ProductListing
      basePath="/women"
      params={params}
      fixed={{ genders: ["WOMEN"] }}
      title="Women"
      description="Comfortable, performance-ready gear for training and everyday wear."
    />
  );
}
