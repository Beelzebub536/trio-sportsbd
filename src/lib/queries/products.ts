import { Prisma, type Gender } from "@prisma/client";
import { unstable_cache } from "next/cache";

import { discountPercent, effectivePrice } from "@/lib/format";
import { CATALOG_TAG, PRODUCT_DETAIL_TAG } from "@/lib/cache-tags";
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

export type ListingResult = {
  items: ProductCardData[];
  total: number;
  page: number;
  perPage: number;
  pageCount: number;
};

const getCachedListing = unstable_cache(
  async (
  filters: ListingFilters,
  sort: SortKey = "newest",
  page = 1,
  perPage = 12,
): Promise<ListingResult> => {
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

  // Effective-price bounds are expressed in SQL so the database can count and
  // page the matching catalogue without loading every product into Node.
  if (filters.minPrice != null || filters.maxPrice != null) {
    const basePrice: Prisma.IntFilter = {};
    const salePrice: Prisma.IntNullableFilter = { not: null };
    if (filters.minPrice != null) {
      basePrice.gte = filters.minPrice;
      salePrice.gte = filters.minPrice;
    }
    if (filters.maxPrice != null) {
      basePrice.lte = filters.maxPrice;
      salePrice.lte = filters.maxPrice;
    }
    where.AND = [
      { OR: [{ salePrice: null, basePrice }, { salePrice }] },
    ];
  }

  const total = await prisma.product.count({ where });
  const pageCount = Math.max(1, Math.ceil(total / perPage));
  const safePage = Math.min(Math.max(1, page), pageCount);
  const start = (safePage - 1) * perPage;
  let items: ProductCardData[];

  if (sort === "newest") {
    const rows = await prisma.product.findMany({
      where,
      select: cardSelect,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      skip: start,
      take: perPage,
    });
    items = rows.map(toCard);
  } else {
    // Price/discount ordering compares the effective sale price and percentage,
    // so sort only the small price index in Node, then fetch cards for this page.
    const candidates = await prisma.product.findMany({
      where,
      select: { id: true, basePrice: true, salePrice: true },
    });
    const sorted = candidates.sort((a, b) => {
      if (sort === "price-asc") {
        return effectivePrice(a.basePrice, a.salePrice) - effectivePrice(b.basePrice, b.salePrice);
      }
      if (sort === "price-desc") {
        return effectivePrice(b.basePrice, b.salePrice) - effectivePrice(a.basePrice, a.salePrice);
      }
      return discountPercent(b.basePrice, b.salePrice) - discountPercent(a.basePrice, a.salePrice);
    });
    const pageIds = sorted.slice(start, start + perPage).map((item) => item.id);
    const rows = await prisma.product.findMany({
      where: { id: { in: pageIds } },
      select: cardSelect,
    });
    const byId = new Map(rows.map((row) => [row.id, row]));
    items = pageIds.flatMap((id) => {
      const row = byId.get(id);
      return row ? [toCard(row)] : [];
    });
  }

  return {
    items,
    total,
    page: safePage,
    perPage,
    pageCount,
  };
  },
  ["catalog-listing-v2"],
  { tags: [CATALOG_TAG], revalidate: 60 },
);

export async function getListing(
  filters: ListingFilters,
  sort: SortKey = "newest",
  page = 1,
  perPage = 12,
): Promise<ListingResult> {
  return getCachedListing(filters, sort, page, perPage);
}

export type Facets = {
  sizes: string[];
  colors: Array<{ name: string; hex: string | null }>;
  brands: string[];
  priceRange: { min: number; max: number };
};

const getCachedFacets = unstable_cache(
  async (): Promise<Facets> => {
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
  },
  ["catalog-facets-v1"],
  { tags: [CATALOG_TAG], revalidate: 300 },
);

export async function getFacets(): Promise<Facets> {
  return getCachedFacets();
}

const getCachedNewArrivals = unstable_cache(
  async (limit: number): Promise<ProductCardData[]> => {
  const rows = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: cardSelect,
  });
  return rows.map(toCard);
  },
  ["new-arrivals-v1"],
  { tags: [CATALOG_TAG], revalidate: 60 },
);

export async function getNewArrivals(limit = 8): Promise<ProductCardData[]> {
  return getCachedNewArrivals(limit);
}

const getCachedFeaturedProducts = unstable_cache(
  async (limit: number): Promise<ProductCardData[]> => {
  const rows = await prisma.product.findMany({
    where: { isActive: true, isFeatured: true },
    orderBy: { updatedAt: "desc" },
    take: limit,
    select: cardSelect,
  });
  return rows.map(toCard);
  },
  ["featured-products-v1"],
  { tags: [CATALOG_TAG], revalidate: 60 },
);

export async function getFeaturedProducts(limit = 8): Promise<ProductCardData[]> {
  return getCachedFeaturedProducts(limit);
}

const getCachedSaleProducts = unstable_cache(
  async (limit: number): Promise<ProductCardData[]> => {
  const rows = await prisma.product.findMany({
    where: { isActive: true, salePrice: { not: null } },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: cardSelect,
  });
  return rows.map(toCard);
  },
  ["sale-products-v1"],
  { tags: [CATALOG_TAG], revalidate: 60 },
);

export async function getSaleProducts(limit = 8): Promise<ProductCardData[]> {
  return getCachedSaleProducts(limit);
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

const getCachedProductBySlug = unstable_cache(
  async (slug: string) => {
    return prisma.product.findFirst({
      where: { slug, isActive: true },
      include: {
        category: true,
        images: { orderBy: { sortOrder: "asc" } },
        variants: { orderBy: [{ color: "asc" }, { size: "asc" }] },
      },
    });
  },
  ["product-by-slug-v1"],
  { tags: [PRODUCT_DETAIL_TAG], revalidate: 60 },
);

export async function getProductBySlug(slug: string) {
  return getCachedProductBySlug(slug);
}

const getCachedRelatedProducts = unstable_cache(
  async (
  productId: number,
  categoryId: number,
  limit = 4,
): Promise<ProductCardData[]> => {
  const rows = await prisma.product.findMany({
    where: { isActive: true, categoryId, id: { not: productId } },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: cardSelect,
  });
  return rows.map(toCard);
  },
  ["related-products-v1"],
  { tags: [CATALOG_TAG], revalidate: 60 },
);

export async function getRelatedProducts(
  productId: number,
  categoryId: number,
  limit = 4,
): Promise<ProductCardData[]> {
  return getCachedRelatedProducts(productId, categoryId, limit);
}

export type ProductDetail = NonNullable<
  Awaited<ReturnType<typeof getProductBySlug>>
>;

export async function getProductsByIds(
  ids: number[],
): Promise<ProductCardData[]> {
  if (ids.length === 0) return [];
  const rows = await prisma.product.findMany({
    where: { id: { in: ids }, isActive: true },
    select: cardSelect,
  });
  return rows.map(toCard);
}
