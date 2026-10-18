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
      <DialogContent className="top-20 max-w-xl translate-y-0 gap-0 overflow-hidden p-0">
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
            className="h-14 flex-1 border-0 shadow-none focus-visible:ring-0"
          />
        </form>

        <div className="max-h-[60vh] overflow-y-auto">
          {loading && (
            <LoadingSurface className="min-h-32" label="Searching products">
              <div className="h-32 bg-gradient-to-br from-white to-slate-100" />
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
                      <span className="block truncate text-sm font-semibold uppercase">
                        {item.name}
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        {item.categoryName}
                      </span>
                    </span>
                    <span className="text-sm font-semibold">
                      {formatBDT(item.price)}
                    </span>
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href={`/search?q=${encodeURIComponent(query.trim())}`}
                  onClick={() => onOpenChange(false)}
                  className="block bg-secondary px-4 py-3 text-center text-xs font-bold uppercase tracking-widest hover:underline"
                >
                  See all results
                </Link>
              </li>
            </ul>
          )}

          {!query.trim() && (
            <p className="px-4 py-6 text-sm text-muted-foreground">
              Start typing to see suggestions.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
