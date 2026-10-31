import type { Metadata } from "next";

import ProductListing from "@/components/product/ProductListing";
import type { RawSearchParams } from "@/lib/listing-params";

export const metadata: Metadata = {
  title: "Kids",
  description: "Kids' jerseys, track pants and training kit.",
  alternates: { canonical: "/kids" },
};

export default async function KidsPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const params = await searchParams;

  return (
    <ProductListing
      basePath="/kids"
      params={params}
      fixed={{ genders: ["KIDS"] }}
      title="Kids"
      description="Durable, comfortable kit for young players."
    />
  );
}
