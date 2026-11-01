import type { Metadata } from "next";

import ProductListing from "@/components/product/ProductListing";
import type { RawSearchParams } from "@/lib/listing-params";

export const metadata: Metadata = {
  title: "Accessories",
  description: "Bags, socks, caps and gloves to complete your kit.",
  alternates: { canonical: "/accessories" },
};

export default async function AccessoriesPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const params = await searchParams;

  return (
    <ProductListing
      basePath="/accessories"
      params={params}
      fixed={{ categorySlugs: ["accessories"] }}
      title="Accessories"
      description="Bags, socks, caps and gloves to complete your kit."
    />
  );
}
