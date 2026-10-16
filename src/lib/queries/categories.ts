import prisma from "@/lib/prisma";

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
export async function getCategoryTree(): Promise<CategoryNode[]> {
  try {
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
  } catch {
    // Never let a transient DB problem take down the whole storefront shell.
    return [];
  }
}

/** Flat list of top-level categories (for menus and tiles). */
export async function getTopLevelCategories(): Promise<CategoryNode[]> {
  const tree = await getCategoryTree();
  return tree;
}
