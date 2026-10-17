import { Suspense } from "react";

import BrandStory from "@/components/home/BrandStory";
import HomeCategories from "@/components/home/HomeCategories";
import HomeHero from "@/components/home/HomeHero";
import HomeProductRow from "@/components/home/HomeProductRow";
import HomeSectionSkeleton from "@/components/home/HomeSectionSkeleton";
import HomeWhatsAppCta from "@/components/home/HomeWhatsAppCta";
import SaleStrip from "@/components/home/SaleStrip";

export default function HomePage() {
  return (
    <>
      <Suspense fallback={<HomeSectionSkeleton kind="hero" />}>
        <HomeHero />
      </Suspense>
      <Suspense fallback={<HomeSectionSkeleton kind="tiles" />}>
        <HomeCategories />
      </Suspense>
      <Suspense fallback={<HomeSectionSkeleton kind="row" />}>
        <HomeProductRow kind="new" title="New arrivals" href="/shop" />
      </Suspense>
      <SaleStrip />
      <Suspense fallback={<HomeSectionSkeleton kind="row" />}>
        <HomeProductRow kind="featured" title="Best sellers" href="/shop" />
      </Suspense>
      <Suspense fallback={<HomeSectionSkeleton kind="row" />}>
        <HomeProductRow kind="sale" title="On sale" href="/sale" />
      </Suspense>
      <BrandStory />
      <Suspense fallback={<HomeSectionSkeleton kind="cta" />}>
        <HomeWhatsAppCta />
      </Suspense>
    </>
  );
}
