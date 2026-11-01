import { Suspense } from "react";
import Link from "next/link";
import { X } from "lucide-react";

import ListingSkeleton from "@/components/product/ListingSkeleton";
import ListingCacheSeed from "@/components/product/ListingCacheSeed";
import FilterPanel from "@/components/product/FilterPanel";
import ListingToolbar from "@/components/product/ListingToolbar";
import Pagination from "@/components/product/Pagination";
import ProductGrid from "@/components/product/ProductGrid";
import { getCategoryTree } from "@/lib/queries/categories";
import { getFacets, getListing } from "@/lib/queries/products";
import { getWishlistProductIds } from "@/lib/queries/wishlist";
import { getSession } from "@/lib/session";
import {
  buildFilterChips,
  parseListingParams,
  toQueryString,
  toArray,
  withParams,
  type FixedFilters,
  type RawSearchParams,
} from "@/lib/listing-params";
import { makeListingCacheKey } from "@/lib/listing-cache-key";

type ProductListingProps = {
  basePath: string;
  params: RawSearchParams;
  fixed?: FixedFilters;
  title?: string;
  description?: string;
};

export default function ProductListing(props: ProductListingProps) {
  return (
    <Suspense fallback={<ListingSkeleton />}>
      <ListingContent {...props} />
    </Suspense>
  );
}

const PER_PAGE = 12;

function ActiveChips({
  chips,
  basePath,
}: {
  chips: Array<{ label: string; href: string }>;
  basePath: string;
}) {
  if (chips.length === 0) return null;

  return (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <Link
          key={`${chip.label}-${chip.href}`}
          href={chip.href}
          className="inline-flex items-center gap-1.5 bg-secondary px-3 py-1 text-xs transition-colors hover:rounded-full bg-primary hover:text-primary-foreground"
        >
          {chip.label}
          <X className="h-3 w-3" />
        </Link>
      ))}
      <Link
        href={basePath}
        className="py-2 text-sm font-semibold text-primary underline underline-offset-4 hover:decoration-2"
      >
        Clear all
      </Link>
    </div>
  );
}

async function ListingContent({
  basePath,
  params,
  fixed = {},
  title,
  description,
}: ProductListingProps) {
  const { filters, sort, page } = parseListingParams(params, fixed);

  const [result, facets, tree, session] = await Promise.all([
    getListing(filters, sort, page, PER_PAGE),
    getFacets(),
    getCategoryTree(),
    getSession(),
  ]);

  const isAuthed = Boolean(session?.user);
  const savedIds =
    isAuthed && session?.user ? await getWishlistProductIds(session.user.id) : [];

  let categoryOptions: Array<{ name: string; slug: string }> = [];
  if (fixed.categorySlugs?.length) {
    fixed.categorySlugs.forEach((slug) => {
      const node = tree.find((category) => category.slug === slug);
      node?.children.forEach((child) =>
        categoryOptions.push({ name: child.name, slug: child.slug }),
      );
    });
  } else {
    categoryOptions = tree.flatMap((node) => [
      { name: node.name, slug: node.slug },
      ...node.children.map((child) => ({ name: child.name, slug: child.slug })),
    ]);
  }

  const chips = buildFilterChips(basePath, params, fixed);

  const filterPanel = (
    <FilterPanel
      action={basePath}
      facets={facets}
      categoryOptions={categoryOptions}
      current={{
        category: toArray(params.category),
        gender: toArray(params.gender),
        size: toArray(params.size),
        color: toArray(params.color),
        brand: toArray(params.brand),
        minPrice: typeof params.minPrice === "string" ? params.minPrice : "",
        maxPrice: typeof params.maxPrice === "string" ? params.maxPrice : "",
        onSale: params.onSale === "1",
      }}
      sort={sort}
      showGender={!fixed.genders?.length}
      showOnSale={!fixed.onSale}
    />
  );

  return (
    <div>
      {(title || description) && (
        <header className="floodlight text-white">
          <div className="mx-auto max-w-7xl px-4 py-10 md:py-14">
            {title && <h1 className="text-6xl md:text-8xl">{title}</h1>}
            {description && (
              <p className="mt-3 max-w-2xl text-base text-white/85">{description}</p>
            )}
          </div>
        </header>
      )}

      <div className="mx-auto max-w-7xl px-4 py-6">

      <ListingToolbar total={result.total} sort={sort} filterPanel={filterPanel} />
      <ActiveChips chips={chips} basePath={basePath} />

      <div className="mt-6 flex gap-8">
        <aside className="hidden w-60 shrink-0 lg:block" aria-label="Filters">
          {filterPanel}
        </aside>

        <div className="min-w-0 flex-1">
          <ListingCacheSeed
            cacheKey={buildListingCacheKey(basePath, params)}
            products={result.items}
          />
          <ProductGrid
            products={result.items}
            isAuthed={isAuthed}
            savedIds={savedIds}
          />
          <Pagination
            page={result.page}
            pageCount={result.pageCount}
            buildHref={(target) =>
              withParams(basePath, params, {
                page: target > 1 ? String(target) : undefined,
              })
            }
          />
        </div>
      </div>
      </div>
    </div>
  );
}

function buildListingCacheKey(basePath: string, params: RawSearchParams): string {
  const query = toQueryString(params);
  const search = query.startsWith("?") ? query.slice(1) : query;
  return makeListingCacheKey(basePath, search);
}
