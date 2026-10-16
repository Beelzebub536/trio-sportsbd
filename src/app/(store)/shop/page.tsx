import type { Metadata } from "next";

import ProductListing from "@/components/product/ProductListing";
import type { RawSearchParams } from "@/lib/listing-params";

export const metadata: Metadata = {
  title: "Shop all",
  description:
    "Browse every jersey, trouser and accessory at Trio Sports BD.",
  alternates: { canonical: "/shop" },
};

export default async function ShopPage({
  searchParams,
}: {
  searchParams: RawSearchParams;
}) {
  const params = await searchParams;

  return (
    <ProductListing
      basePath="/shop"
      params={params}
      title="Shop all"
      description="Jerseys, trousers and accessories for every sport — with cash on delivery across Bangladesh."
    />
  );
}
