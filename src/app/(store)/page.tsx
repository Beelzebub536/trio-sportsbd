import BrandStory from "@/components/home/BrandStory";
import CategoryTiles from "@/components/home/CategoryTiles";
import HeroCarousel from "@/components/home/HeroCarousel";
import ProductRow from "@/components/home/ProductRow";
import SaleStrip from "@/components/home/SaleStrip";
import WhatsAppCta from "@/components/home/WhatsAppCta";
import { getActiveBanners } from "@/lib/queries/banners";
import { getTopLevelCategories } from "@/lib/queries/categories";
import {
  getFeaturedProducts,
  getNewArrivals,
  getSaleProducts,
} from "@/lib/queries/products";
import { getSettings } from "@/lib/settings";

export default async function HomePage() {
  const [banners, categories, newArrivals, bestSellers, saleProducts, settings] =
    await Promise.all([
      getActiveBanners(),
      getTopLevelCategories(),
      getNewArrivals(8),
      getFeaturedProducts(8),
      getSaleProducts(8),
      getSettings(),
    ]);

  return (
    <>
      <HeroCarousel banners={banners} />
      <CategoryTiles categories={categories} />
      <ProductRow title="New arrivals" href="/shop" products={newArrivals} />
      <SaleStrip />
      <ProductRow title="Best sellers" href="/shop" products={bestSellers} />
      <ProductRow title="On sale" href="/sale" products={saleProducts} />
      <BrandStory />
      <WhatsAppCta
        whatsappNumber={settings.whatsappNumber}
        supportHours={settings.supportHours}
      />
    </>
  );
}
