import type { Gender } from "@prisma/client";

import type { ListingFilters, SortKey } from "@/lib/queries/products";

export type RawSearchParams = Record<string, string | string[] | undefined>;

export const SORT_OPTIONS: Array<{ value: SortKey; label: string }> = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "discount", label: "Biggest discount" },
];

export const GENDER_OPTIONS: Array<{ value: Gender; label: string }> = [
  { value: "MEN", label: "Men" },
  { value: "WOMEN", label: "Women" },
  { value: "KIDS", label: "Kids" },
  { value: "UNISEX", label: "Unisex" },
];

export const toArray = (value: string | string[] | undefined): string[] => {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === "string" && value.length > 0) return [value];
  return [];
};

export type FixedFilters = {
  categorySlugs?: string[];
  genders?: Gender[];
  onSale?: boolean;
  search?: string;
};

export type ParsedListing = {
  filters: ListingFilters;
  sort: SortKey;
  page: number;
};

export function parseListingParams(
  params: RawSearchParams,
  fixed: FixedFilters = {},
): ParsedListing {
  const categories = toArray(params.category);
  const genders = toArray(params.gender).filter((value): value is Gender =>
    ["MEN", "WOMEN", "KIDS", "UNISEX"].includes(value),
  );

  const min = Number(params.minPrice);
  const max = Number(params.maxPrice);

  const sortRaw = typeof params.sort === "string" ? params.sort : "newest";
  const sort: SortKey = SORT_OPTIONS.some((option) => option.value === sortRaw)
    ? (sortRaw as SortKey)
    : "newest";

  const page = Math.max(1, Number(params.page) || 1);

  return {
    filters: {
      categorySlugs: categories.length ? categories : fixed.categorySlugs,
      genders: genders.length ? genders : fixed.genders,
      sizes: toArray(params.size),
      colors: toArray(params.color),
      brands: toArray(params.brand),
      minPrice: Number.isFinite(min) && min > 0 ? min : undefined,
      maxPrice: Number.isFinite(max) && max > 0 ? max : undefined,
      onSale: Boolean(fixed.onSale) || params.onSale === "1",
      search: fixed.search,
    },
    sort,
    page,
  };
}

export function toQueryString(params: RawSearchParams): string {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value == null) return;
    if (Array.isArray(value)) {
      value.filter(Boolean).forEach((entry) => search.append(key, entry));
    } else if (value.length > 0) {
      search.append(key, value);
    }
  });
  const query = search.toString();
  return query ? `?${query}` : "";
}

/** Build `?sort=...&page=n` preserving the current listing path. */
export function withParams(
  basePath: string,
  params: RawSearchParams,
  overrides: RawSearchParams,
): string {
  const merged: RawSearchParams = { ...params, ...overrides };
  Object.entries(overrides).forEach(([key, value]) => {
    if (value === undefined || value === "" || (Array.isArray(value) && value.length === 0)) {
      delete merged[key];
    }
  });
  return `${basePath}${toQueryString(merged)}`;
}

export type FilterChip = { label: string; href: string };

const MEASURE_LABELS: Record<string, string> = {
  minPrice: "Min price",
  maxPrice: "Max price",
};

/** One removable chip per active filter (excludes sort/page). */
export function buildFilterChips(
  basePath: string,
  params: RawSearchParams,
  fixed: FixedFilters,
): FilterChip[] {
  const chips: FilterChip[] = [];
  const remove = (key: string, value?: string): string => {
    if (value === undefined) {
      return withParams(basePath, params, { [key]: undefined });
    }
    const rest = toArray(params[key]).filter((entry) => entry !== value);
    return withParams(basePath, params, { [key]: rest.length ? rest : undefined });
  };

  if (!fixed.categorySlugs?.length) {
    toArray(params.category).forEach((slug) =>
      chips.push({ label: slug.replace(/-/g, " "), href: remove("category", slug) }),
    );
  }
  if (!fixed.genders?.length) {
    toArray(params.gender).forEach((gender) =>
      chips.push({
        label: GENDER_OPTIONS.find((o) => o.value === gender)?.label ?? gender,
        href: remove("gender", gender),
      }),
    );
  }
  toArray(params.size).forEach((size) =>
    chips.push({ label: `Size ${size}`, href: remove("size", size) }),
  );
  toArray(params.color).forEach((color) =>
    chips.push({ label: color, href: remove("color", color) }),
  );
  toArray(params.brand).forEach((brand) =>
    chips.push({ label: brand, href: remove("brand", brand) }),
  );
  (["minPrice", "maxPrice"] as const).forEach((key) => {
    const value = params[key];
    if (typeof value === "string" && value) {
      chips.push({
        label: `${MEASURE_LABELS[key]} ${value}`,
        href: remove(key),
      });
    }
  });
  if (!fixed.onSale && params.onSale === "1") {
    chips.push({ label: "On sale", href: remove("onSale") });
  }

  return chips;
}
