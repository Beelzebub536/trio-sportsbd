"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import LoadingSurface from "@/components/ui/LoadingSurface";
import { formatBDT } from "@/lib/format";
import { useDebouncedValue } from "@/lib/hooks";

const POPULAR = ["Football jersey", "Cricket jersey", "Track pants", "Shorts", "Socks", "Bag"];

type Suggestion = {
  id: number;
  name: string;
  slug: string;
  image: string | null;
  price: number;
  categoryName: string;
};

export default function SearchOverlay({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const debounced = useDebouncedValue(query, 250);
  const router = useRouter();

  useEffect(() => {
    if (!open) {
      setQuery("");
      setItems([]);
    }
  }, [open]);

  useEffect(() => {
    const term = debounced.trim();
    if (!term) {
      setItems([]);
      return;
    }

    let cancelled = false;
    setLoading(true);

    fetch(`/api/search?q=${encodeURIComponent(term)}`)
      .then((response) => response.json())
      .then((data: { items?: Suggestion[] }) => {
        if (!cancelled) setItems(data.items ?? []);
      })
      .catch(() => {
        if (!cancelled) setItems([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [debounced]);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const term = query.trim();
    if (!term) return;
    onOpenChange(false);
    router.push(`/search?q=${encodeURIComponent(term)}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="top-0 max-w-xl translate-y-0 gap-0 overflow-hidden p-0 sm:top-20">
        <DialogTitle className="sr-only">Search products</DialogTitle>
        <form
          onSubmit={submit}
          className="flex items-center gap-3 border-b border-border px-4"
        >
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <Input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search jerseys, trousers, accessories…"
            aria-label="Search products"
            className="h-14 flex-1 border-0 text-base shadow-none focus-visible:ring-0"
          />
        </form>

        <div className="max-h-[60vh] overflow-y-auto">
          {loading && (
            <LoadingSurface className="min-h-32" label="Searching products">
              <div className="h-32 bg-secondary" />
            </LoadingSurface>
          )}

          {!loading && query.trim() && items.length === 0 && (
            <p className="px-4 py-6 text-sm text-muted-foreground">
              No products match “{query.trim()}”.
            </p>
          )}

          {!loading && items.length > 0 && (
            <ul>
              {items.map((item) => (
                <li key={item.id}>
                  <Link
                    href={`/product/${item.slug}`}
                    onClick={() => onOpenChange(false)}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-secondary"
                  >
                    <span className="relative h-14 w-12 shrink-0 overflow-hidden bg-secondary">
                      {item.image && (
                        <Image
                          src={item.image}
                          alt=""
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold">
                        {item.name}
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        {item.categoryName}
                      </span>
                    </span>
                    <span className="price text-sm font-semibold">
                      {formatBDT(item.price)}
                    </span>
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href={`/search?q=${encodeURIComponent(query.trim())}`}
                  onClick={() => onOpenChange(false)}
                  className="block bg-secondary px-4 py-3 text-center text-sm font-semibold hover:underline"
                >
                  See all results
                </Link>
              </li>
            </ul>
          )}

          {!query.trim() && (
            <div className="px-4 py-5">
              <p className="text-sm text-muted-foreground">Popular right now</p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {POPULAR.map((term) => (
                  <li key={term}>
                    <button
                      type="button"
                      onClick={() => setQuery(term)}
                      className="press rounded-full border border-border px-4 py-2 text-sm font-medium hover:border-primary hover:text-primary"
                    >
                      {term}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
