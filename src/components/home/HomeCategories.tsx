import CategoryTiles from "@/components/home/CategoryTiles";
import { getTopLevelCategories } from "@/lib/queries/categories";

export default async function HomeCategories() {
  return <CategoryTiles categories={await getTopLevelCategories()} />;
}
