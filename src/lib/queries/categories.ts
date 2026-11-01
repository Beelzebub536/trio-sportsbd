import { cache } from "react";
import { unstable_cache } from "next/cache";

import prisma from "@/lib/prisma";
import { CATEGORIES_TAG } from "@/lib/cache-tags";

export type CategoryNode = {
  id: number;
  name: string;
  slug: string;
  parentId: number | null;
  image: string | null;
  sortOrder: number;
  children: CategoryNode[];
};

/** All categories as a parent/child tree, ordered by `sortOrder`. */
const getCachedCategoryTree = unstable_cache(
  async (): Promise<CategoryNode[]> => {
    const rows = await prisma.category.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        slug: true,
        parentId: true,
        image: true,
        sortOrder: true,
      },
    });

    const byId = new Map<number, CategoryNode>();
    rows.forEach((row) => byId.set(row.id, { ...row, children: [] }));

    const roots: CategoryNode[] = [];
    byId.forEach((node) => {
      const parent = node.parentId != null ? byId.get(node.parentId) : undefined;
      if (parent) parent.children.push(node);
      else roots.push(node);
    });

    return roots;
  },
  ["category-tree-v1"],
  { tags: [CATEGORIES_TAG], revalidate: 300 },
);

// Never let a transient DB problem take down the storefront shell, and never cache that failure.
export const getCategoryTree = cache(async (): Promise<CategoryNode[]> => {
  try {
    return await getCachedCategoryTree();
  } catch {
    return [];
  }
});

/** Flat list of top-level categories (for menus and tiles). */
export async function getTopLevelCategories(): Promise<CategoryNode[]> {
  const tree = await getCategoryTree();
  return tree;
}
