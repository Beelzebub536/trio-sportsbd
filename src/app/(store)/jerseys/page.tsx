import type { Metadata } from "next";

import ProductListing from "@/components/product/ProductListing";
import type { RawSearchParams } from "@/lib/listing-params";

export const metadata: Metadata = {
  title: "Jerseys",
  description: "Football and cricket jerseys for men, women and kids.",
  alternates: { canonical: "/jerseys" },
};

export default async function JerseysPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const params = await searchParams;

  return (
    <ProductListing
      basePath="/jerseys"
      params={params}
      fixed={{ categorySlugs: ["jerseys"] }}
      title="Jerseys"
      description="Football and cricket jerseys built for match day."
    />
  );
}
