import type { Metadata } from "next";

import ProductListing from "@/components/product/ProductListing";
import type { RawSearchParams } from "@/lib/listing-params";

export const metadata: Metadata = {
  title: "Trousers",
  description: "Track pants and training shorts for every session.",
  alternates: { canonical: "/trousers" },
};

export default async function TrousersPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const params = await searchParams;

  return (
    <ProductListing
      basePath="/trousers"
      params={params}
      fixed={{ categorySlugs: ["trousers"] }}
      title="Trousers"
      description="Track pants and shorts that move with you."
    />
  );
}
