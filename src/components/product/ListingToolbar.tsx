"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SORT_OPTIONS } from "@/lib/listing-params";

export default function ListingToolbar({
  total,
  sort,
  filterPanel,
}: {
  total: number;
  sort: string;
  filterPanel: React.ReactNode;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const changeSort = (value: string) => {
    const params = new URLSearchParams(window.location.search);
    if (value === "newest") params.delete("sort");
    else params.set("sort", value);
    params.delete("page");
    const query = params.toString();
    router.push(`${window.location.pathname}${query ? `?${query}` : ""}`);
  };

  return (
    <div className="flex items-center justify-between gap-3 border-b border-border pb-4">
      <p className="price text-sm text-muted-foreground">
        {total} {total === 1 ? "product" : "products"}
      </p>

      <div className="flex items-center gap-2">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button
              type="button"
              className="press flex h-11 items-center gap-2 rounded-full border border-foreground px-4 text-sm font-semibold lg:hidden"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filter
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto">
            <SheetHeader className="text-left">
              <SheetTitle className="text-lg font-bold">
                Filters
              </SheetTitle>
            </SheetHeader>
            <div className="px-1 pb-8">{filterPanel}</div>
          </SheetContent>
        </Sheet>

        <Select value={sort} onValueChange={changeSort}>
          <SelectTrigger className="h-9 w-[180px] text-xs" aria-label="Sort by">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
