"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { savePriceBatch } from "@/actions/admin/prices";
import PriceCell from "@/components/admin/PriceCell";
import PriceFilters, {
  EMPTY_FILTERS,
  type PriceFiltersState,
} from "@/components/admin/PriceFilters";
import PriceImportDialog from "@/components/admin/PriceImportDialog";
import PriceReviewDialog from "@/components/admin/PriceReviewDialog";
import PriceToolbar from "@/components/admin/PriceToolbar";
import { Button } from "@/components/ui/button";
import { toPriceCsv } from "@/lib/csv";
import { discountPercent } from "@/lib/format";
import {
  applyOperationToSelection,
  buildDiff,
  type BulkOperation,
  type EditorProduct,
  type PriceDiff,
  type PriceEdit,
  type PriceRow,
} from "@/lib/prices";

type DialogState = {
  mode: "stage" | "save";
  diff: PriceDiff[];
  pending?: Record<number, PriceEdit>;
  warnings?: number;
};

export default function PriceEditor({
  products,
}: {
  products: EditorProduct[];
}) {
  const router = useRouter();

  const [edits, setEdits] = useState<Record<number, PriceEdit>>({});
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [filters, setFilters] = useState<PriceFiltersState>(EMPTY_FILTERS);
  const [dialog, setDialog] = useState<DialogState | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [busy, setBusy] = useState(false);

  const categories = useMemo(
    () => [...new Set(products.map((p) => p.categoryName))].sort(),
    [products],
  );
  const brands = useMemo(
    () =>
      [...new Set(products.map((p) => p.brand).filter((b): b is string => !!b))].sort(),
    [products],
  );
  const byId = useMemo(
    () => new Map(products.map((product) => [product.id, product])),
    [products],
  );

  const current = (product: EditorProduct): PriceEdit =>
    edits[product.id] ?? {
      basePrice: product.basePrice,
      salePrice: product.salePrice,
    };

  const commit = (product: EditorProduct, patch: Partial<PriceEdit>) =>
    setEdits((prev) => ({
      ...prev,
      [product.id]: { ...current(product), ...patch },
    }));

  const filtered = useMemo(() => {
    const query = filters.q.trim().toLowerCase();
    return products.filter((product) => {
      const value = edits[product.id] ?? {
        basePrice: product.basePrice,
        salePrice: product.salePrice,
      };
      if (
        query &&
        !`${product.name} ${product.slug} ${product.brand ?? ""}`
          .toLowerCase()
          .includes(query)
      ) {
        return false;
      }
      if (filters.category !== "all" && product.categoryName !== filters.category)
        return false;
      if (filters.gender !== "all" && product.gender !== filters.gender)
        return false;
      if (filters.brand !== "all" && (product.brand ?? "") !== filters.brand)
        return false;
      if (
        filters.onSale &&
        (value.salePrice == null || value.salePrice >= value.basePrice)
      ) {
        return false;
      }
      if (filters.activeOnly && !product.isActive) return false;
      return true;
    });
  }, [products, filters, edits]);

  const dirtyCount = Object.keys(edits).length;
  const allFilteredSelected =
    filtered.length > 0 && filtered.every((product) => selected.has(product.id));

  const toggleAllFiltered = () =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (allFilteredSelected) {
        filtered.forEach((product) => next.delete(product.id));
      } else {
        filtered.forEach((product) => next.add(product.id));
      }
      return next;
    });

  const toggleRow = (id: number) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const previewOperation = (operation: BulkOperation) => {
    const rows: PriceRow[] = [...selected].flatMap((id) => {
      const product = byId.get(id);
      if (!product) return [];
      const value = current(product);
      return [{ id, basePrice: value.basePrice, salePrice: value.salePrice }];
    });

    const { pending, warnings } = applyOperationToSelection(rows, operation);
    setDialog({
      mode: "stage",
      diff: buildDiff(products, { ...edits, ...pending }),
      pending,
      warnings,
    });
  };

  const openSaveDialog = () => {
    const diff = buildDiff(products, edits);
    if (diff.length === 0) {
      toast.info("No changes to save yet.");
      return;
    }
    setDialog({ mode: "save", diff });
  };

  const confirmDialog = async () => {
    if (!dialog) return;

    if (dialog.mode === "stage") {
      setEdits((prev) => ({ ...prev, ...dialog.pending }));
      setDialog(null);
      return;
    }

    setBusy(true);
    const result = await savePriceBatch({
      label,
      edits: Object.entries(edits).map(([id, edit]) => ({
        id: Number(id),
        basePrice: edit.basePrice,
        salePrice: edit.salePrice,
      })),
    });
    setBusy(false);

    if (!result.ok) {
      toast.error(result.error ?? "Could not save the price batch.");
      return;
    }

    toast.success(
      `Saved ${result.changed} price${result.changed === 1 ? "" : "s"}`,
    );
    setEdits({});
    setSelected(new Set());
    setLabel("");
    setDialog(null);
    router.refresh();
  };

  const exportCsv = () => {
    const csv = toPriceCsv(
      filtered.map((product) => {
        const value = current(product);
        return {
          slug: product.slug,
          basePrice: value.basePrice,
          salePrice: value.salePrice,
        };
      }),
    );
    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = `trio-prices-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5 pb-24">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold uppercase leading-none md:text-3xl">
            Bulk prices
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {filtered.length} of {products.length} products shown.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" asChild>
            <Link href="/admin/prices/history">History</Link>
          </Button>
          <Button variant="outline" onClick={() => setImportOpen(true)}>
            Import CSV
          </Button>
          <Button variant="outline" onClick={exportCsv}>
            Export CSV
          </Button>
        </div>
      </div>

      <PriceFilters
        filters={filters}
        categories={categories}
        brands={brands}
        onChange={setFilters}
      />

      <PriceToolbar
        selectedCount={selected.size}
        onPreview={previewOperation}
      />

      <div className="overflow-x-auto border border-border">
        <table className="w-full border-collapse text-sm">
          <thead className="sticky top-0 z-10 bg-black text-white">
            <tr className="text-left text-xs uppercase tracking-widest">
              <th className="px-3 py-2">
                <input
                  type="checkbox"
                  aria-label="Select all matching filters"
                  checked={allFilteredSelected}
                  onChange={toggleAllFiltered}
                />
              </th>
              <th className="px-3 py-2">Product</th>
              <th className="px-3 py-2">Category</th>
              <th className="px-3 py-2">Base price</th>
              <th className="px-3 py-2">Sale price</th>
              <th className="px-3 py-2">Discount</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((product) => {
              const value = current(product);
              const dirty = edits[product.id] != null;
              const invalid =
                value.basePrice <= 0 ||
                (value.salePrice != null && value.salePrice >= value.basePrice);
              const discount = discountPercent(value.basePrice, value.salePrice);

              return (
                <tr
                  key={product.id}
                  className={
                    invalid
                      ? "border-b border-border bg-red-50"
                      : dirty
                        ? "border-b border-border bg-amber-50"
                        : "border-b border-border"
                  }
                >
                  <td className="px-3 py-2">
                    <input
                      type="checkbox"
                      aria-label={`Select ${product.name}`}
                      checked={selected.has(product.id)}
                      onChange={() => toggleRow(product.id)}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <span className="flex items-center gap-3">
                      <span className="h-10 w-8 shrink-0 overflow-hidden bg-secondary">
                        {product.image && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={product.image}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        )}
                      </span>
                      <span className="min-w-0">
                        <span className="block font-semibold">
                          {product.name}
                        </span>
                        <span className="block text-xs text-muted-foreground">
                          /{product.slug}
                          {product.isActive ? "" : " · hidden"}
                        </span>
                      </span>
                    </span>
                  </td>
                  <td className="px-3 py-2 text-xs text-muted-foreground">
                    {product.categoryName}
                  </td>
                  <td className="px-3 py-2">
                    <PriceCell
                      value={value.basePrice}
                      label={`Base price for ${product.name}`}
                      onCommit={(next) =>
                        commit(product, { basePrice: next ?? 0 })
                      }
                    />
                  </td>
                  <td className="px-3 py-2">
                    <PriceCell
                      value={value.salePrice}
                      label={`Sale price for ${product.name}`}
                      allowEmpty
                      onCommit={(next) => commit(product, { salePrice: next })}
                    />
                  </td>
                  <td className="px-3 py-2 tabular-nums">
                    {discount > 0 ? `${discount}%` : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <p className="p-5 text-sm text-muted-foreground">
            No products match these filters.
          </p>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        Prices are whole taka. A sale price must be below the base price;
        clearing it means the product sells at its base price.
      </p>

      {dirtyCount > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-white shadow-[0_-4px_12px_rgba(0,0,0,0.08)]">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3">
            <p className="text-sm font-bold uppercase tracking-wide">
              {dirtyCount} unsaved change{dirtyCount === 1 ? "" : "s"}
            </p>
            <div className="ml-auto flex gap-2">
              <Button variant="outline" onClick={() => setEdits({})}>
                Discard
              </Button>
              <Button onClick={openSaveDialog}>Review &amp; Save</Button>
            </div>
          </div>
        </div>
      )}

      <PriceReviewDialog
        open={dialog != null}
        mode={dialog?.mode ?? "stage"}
        diff={dialog?.diff ?? []}
        label={label}
        busy={busy}
        warnings={dialog?.warnings}
        onLabelChange={setLabel}
        onCancel={() => setDialog(null)}
        onConfirm={confirmDialog}
      />

      <PriceImportDialog
        open={importOpen}
        products={products}
        onCancel={() => setImportOpen(false)}
        onApply={(imported) => {
          setEdits((prev) => ({ ...prev, ...imported }));
          setImportOpen(false);
          toast.success(
            `${Object.keys(imported).length} row(s) staged — review and save.`,
          );
        }}
      />
    </div>
  );
}
