import HeroCarousel from "@/components/home/HeroCarousel";
import { getActiveBanners } from "@/lib/queries/banners";

export default async function HomeHero() {
  return <HeroCarousel banners={await getActiveBanners()} />;
}
