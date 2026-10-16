import Link from "next/link";

import { cn } from "@/lib/utils";

export default function Pagination({
  page,
  pageCount,
  buildHref,
}: {
  page: number;
  pageCount: number;
  buildHref: (page: number) => string;
}) {
  if (pageCount <= 1) return null;

  const pages = Array.from({ length: pageCount }, (_, index) => index + 1);

  return (
    <nav aria-label="Pagination" className="mt-10 flex items-center justify-center gap-1">
      {page > 1 && (
        <Link
          href={buildHref(page - 1)}
          className="border border-border px-3 py-2 text-xs font-bold uppercase tracking-widest hover:bg-secondary"
        >
          Prev
        </Link>
      )}

      {pages.map((number) => (
        <Link
          key={number}
          href={buildHref(number)}
          aria-current={number === page ? "page" : undefined}
          className={cn(
            "border px-3 py-2 text-xs font-bold",
            number === page
              ? "border-black bg-black text-white"
              : "border-border hover:bg-secondary",
          )}
        >
          {number}
        </Link>
      ))}

      {page < pageCount && (
        <Link
          href={buildHref(page + 1)}
          className="border border-border px-3 py-2 text-xs font-bold uppercase tracking-widest hover:bg-secondary"
        >
          Next
        </Link>
      )}
    </nav>
  );
}
