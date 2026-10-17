export function makeListingCacheKey(pathname: string, search: string): string {
  const params = new URLSearchParams(
    search.startsWith("?") ? search.slice(1) : search,
  );
  params.sort();
  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}
