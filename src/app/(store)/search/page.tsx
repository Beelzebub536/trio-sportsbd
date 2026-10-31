import type { Metadata } from "next";

import ProductListing from "@/components/product/ProductListing";
import type { RawSearchParams } from "@/lib/listing-params";

export const metadata: Metadata = {
  title: "Search",
  robots: { index: false, follow: true },
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q.trim() : "";

  return (
    <ProductListing
      basePath="/search"
      params={params}
      fixed={{ search: query }}
      title={query ? `Results for “${query}”` : "Search"}
      description="Use the filters to narrow down what you are looking for."
    />
  );
}
