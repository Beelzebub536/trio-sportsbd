import { Prisma, type Gender } from "@prisma/client";

import { discountPercent, effectivePrice } from "@/lib/format";
import prisma from "@/lib/prisma";

export type ProductCardData = {
  id: number;
  name: string;
  slug: string;
  brand: string | null;
  categoryName: string;
  categorySlug: string;
  basePrice: number;
  salePrice: number | null;
  image: string | null;
  secondImage: string | null;
  colorCount: number;
  createdAt: Date;
};

const cardSelect = {
  id: true,
  name: true,
  slug: true,
  brand: true,
  basePrice: true,
  salePrice: true,
  createdAt: true,
  category: { select: { name: true, slug: true } },
  images: {
    select: { url: true, sortOrder: true },
    orderBy: { sortOrder: "asc" },
  },
  variants: { select: { color: true } },
} satisfies Prisma.ProductSelect;

type CardRow = Prisma.ProductGetPayload<{ select: typeof cardSelect }>;

const toCard = (row: CardRow): ProductCardData => ({
  id: row.id,
  name: row.name,
  slug: row.slug,
  brand: row.brand,
  categoryName: row.category.name,
  categorySlug: row.category.slug,
  basePrice: row.basePrice,
  salePrice: row.salePrice,
  image: row.images[0]?.url ?? null,
  secondImage: row.images[1]?.url ?? null,
  colorCount: new Set(row.variants.map((v) => v.color)).size,
  createdAt: row.createdAt,
});

export type SortKey = "newest" | "price-asc" | "price-desc" | "discount";

export type ListingFilters = {
  categorySlugs?: string[];
  genders?: Gender[];
  sizes?: string[];
  colors?: string[];
  brands?: string[];
  minPrice?: number;
  maxPrice?: number;
  onSale?: boolean;
  search?: string;
};

async function resolveCategoryIds(slugs: string[]): Promise<number[]> {
  if (slugs.length === 0) return [];
  const all = await prisma.category.findMany({
    select: { id: true, slug: true, parentId: true },
  });
  const bySlug = new Map(all.map((c) => [c.slug, c]));
  const ids = new Set<number>();
  for (const slug of slugs) {
    const category = bySlug.get(slug);
    if (!category) continue;
    ids.add(category.id);
    all.filter((c) => c.parentId === category.id).forEach((c) => ids.add(c.id));
  }
  return [...ids];
}

const sortCards = (items: ProductCardData[], sort: SortKey): ProductCardData[] => {
  const copy = [...items];
  switch (sort) {
    case "price-asc":
      return copy.sort(
        (a, b) =>
          effectivePrice(a.basePrice, a.salePrice) -
          effectivePrice(b.basePrice, b.salePrice),
      );
    case "price-desc":
      return copy.sort(
        (a, b) =>
          effectivePrice(b.basePrice, b.salePrice) -
          effectivePrice(a.basePrice, a.salePrice),
      );
    case "discount":
      return copy.sort(
        (a, b) =>
          discountPercent(b.basePrice, b.salePrice) -
          discountPercent(a.basePrice, a.salePrice),
      );
    case "newest":
    default:
      return copy.sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
      );
  }
};

export type ListingResult = {
  items: ProductCardData[];
  total: number;
  page: number;
  perPage: number;
  pageCount: number;
};

export async function getListing(
  filters: ListingFilters,
  sort: SortKey = "newest",
  page = 1,
  perPage = 12,
): Promise<ListingResult> {
  const where: Prisma.ProductWhereInput = { isActive: true };

  if (filters.categorySlugs?.length) {
    const ids = await resolveCategoryIds(filters.categorySlugs);
    where.categoryId = { in: ids.length ? ids : [-1] };
  }
  if (filters.genders?.length) where.gender = { in: filters.genders };
  if (filters.brands?.length) where.brand = { in: filters.brands };
  if (filters.onSale) where.salePrice = { not: null };
  if (filters.sizes?.length || filters.colors?.length) {
    where.variants = {
      some: {
        ...(filters.sizes?.length ? { size: { in: filters.sizes } } : {}),
        ...(filters.colors?.length ? { color: { in: filters.colors } } : {}),
      },
    };
  }
  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: "insensitive" } },
      { brand: { contains: filters.search, mode: "insensitive" } },
      { description: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  const rows = await prisma.product.findMany({ where, select: cardSelect });
  let items = rows.map(toCard);

  // Price filters use the effective (sale-aware) price.
  if (filters.minPrice != null || filters.maxPrice != null) {
    items = items.filter((item) => {
      const price = effectivePrice(item.basePrice, item.salePrice);
      if (filters.minPrice != null && price < filters.minPrice) return false;
      if (filters.maxPrice != null && price > filters.maxPrice) return false;
      return true;
    });
  }

  items = sortCards(items, sort);

  const total = items.length;
  const pageCount = Math.max(1, Math.ceil(total / perPage));
  const safePage = Math.min(Math.max(1, page), pageCount);
  const start = (safePage - 1) * perPage;

  return {
    items: items.slice(start, start + perPage),
    total,
    page: safePage,
    perPage,
    pageCount,
  };
}

export type Facets = {
  sizes: string[];
  colors: Array<{ name: string; hex: string | null }>;
  brands: string[];
  priceRange: { min: number; max: number };
};

export async function getFacets(): Promise<Facets> {
  const [variants, brandRows, priceAgg] = await Promise.all([
    prisma.productVariant.findMany({
      where: { product: { isActive: true } },
      select: { size: true, color: true, colorHex: true },
    }),
    prisma.product.findMany({
      where: { isActive: true, brand: { not: null } },
      select: { brand: true },
      distinct: ["brand"],
      orderBy: { brand: "asc" },
    }),
    prisma.product.aggregate({
      where: { isActive: true },
      _min: { basePrice: true },
      _max: { basePrice: true },
    }),
  ]);

  const sizes = [...new Set(variants.map((v) => v.size))].sort((a, b) =>
    a.localeCompare(b, undefined, { numeric: true }),
  );

  const colorMap = new Map<string, string | null>();
  variants.forEach((v) => {
    if (!colorMap.has(v.color)) colorMap.set(v.color, v.colorHex);
  });
  const colors = [...colorMap.entries()]
    .map(([name, hex]) => ({ name, hex }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return {
    sizes,
    colors,
    brands: brandRows.map((b) => b.brand).filter((b): b is string => Boolean(b)),
    priceRange: {
      min: priceAgg._min.basePrice ?? 0,
      max: priceAgg._max.basePrice ?? 10000,
    },
  };
}

export async function getNewArrivals(limit = 8): Promise<ProductCardData[]> {
  const rows = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: cardSelect,
  });
  return rows.map(toCard);
}

export async function getFeaturedProducts(limit = 8): Promise<ProductCardData[]> {
  const rows = await prisma.product.findMany({
    where: { isActive: true, isFeatured: true },
    orderBy: { updatedAt: "desc" },
    take: limit,
    select: cardSelect,
  });
  return rows.map(toCard);
}

export async function getSaleProducts(limit = 8): Promise<ProductCardData[]> {
  const rows = await prisma.product.findMany({
    where: { isActive: true, salePrice: { not: null } },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: cardSelect,
  });
  return rows.map(toCard);
}

export async function searchProductCards(
  query: string,
  limit = 6,
): Promise<ProductCardData[]> {
  const term = query.trim();
  if (!term) return [];
  const rows = await prisma.product.findMany({
    where: {
      isActive: true,
      OR: [
        { name: { contains: term, mode: "insensitive" } },
        { brand: { contains: term, mode: "insensitive" } },
        { category: { name: { contains: term, mode: "insensitive" } } },
      ],
    },
    take: limit,
    select: cardSelect,
  });
  return rows.map(toCard);
}

export async function getProductBySlug(slug: string) {
  return prisma.product.findFirst({
    where: { slug, isActive: true },
    include: {
      category: true,
      images: { orderBy: { sortOrder: "asc" } },
      variants: { orderBy: [{ color: "asc" }, { size: "asc" }] },
    },
  });
}

export async function getRelatedProducts(
  productId: number,
  categoryId: number,
  limit = 4,
): Promise<ProductCardData[]> {
  const rows = await prisma.product.findMany({
    where: { isActive: true, categoryId, id: { not: productId } },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: cardSelect,
  });
  return rows.map(toCard);
}

export type ProductDetail = NonNullable<
  Awaited<ReturnType<typeof getProductBySlug>>
>;
