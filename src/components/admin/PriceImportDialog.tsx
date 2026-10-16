"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { parsePriceCsv } from "@/lib/csv";
import type { EditorProduct, PriceEdit } from "@/lib/prices";

type ImportRow = {
  line: number;
  key: string;
  basePrice: number | null;
  salePrice: number | null;
  productId: number | null;
  error?: string;
};

export default function PriceImportDialog({
  open,
  products,
  onApply,
  onCancel,
}: {
  open: boolean;
  products: EditorProduct[];
  onApply: (edits: Record<number, PriceEdit>) => void;
  onCancel: () => void;
}) {
  const [text, setText] = useState("");

  const lookup = useMemo(() => {
    const bySlug = new Map<string, EditorProduct>();
    const bySku = new Map<string, EditorProduct>();
    for (const product of products) {
      bySlug.set(product.slug.toLowerCase(), product);
      for (const sku of product.skus) {
        bySku.set(sku.toLowerCase(), product);
      }
    }
    return { bySlug, bySku };
  }, [products]);

  const { rows, headerError } = useMemo(() => {
    if (!text.trim()) return { rows: [] as ImportRow[], headerError: undefined };

    const parsed = parsePriceCsv(text);
    if (parsed.headerError) {
      return { rows: [] as ImportRow[], headerError: parsed.headerError };
    }

    const built: ImportRow[] = parsed.rows.map((row) => {
      const product =
        (row.slug ? lookup.bySlug.get(row.slug.toLowerCase()) : undefined) ??
        (row.sku ? lookup.bySku.get(row.sku.toLowerCase()) : undefined) ??
        null;

      const key = row.slug || row.sku || "—";
      const base = Number(row.basePrice);
      const saleRaw = row.salePrice.trim();
      const sale = saleRaw === "" ? null : Number(saleRaw);

      let error: string | undefined;
      if (!product) {
        error = "No product matches this slug or SKU";
      } else if (!Number.isInteger(base) || base <= 0) {
        error = "basePrice must be a whole number above 0";
      } else if (sale != null && (!Number.isInteger(sale) || sale <= 0)) {
        error = "salePrice must be a whole number above 0 or empty";
      } else if (sale != null && sale >= base) {
        error = "salePrice must be below basePrice";
      }

      return {
        line: row.line,
        key,
        basePrice: Number.isFinite(base) ? base : null,
        salePrice: sale != null && Number.isFinite(sale) ? sale : null,
        productId: product?.id ?? null,
        error,
      };
    });

    return { rows: built, headerError: undefined };
  }, [text, lookup]);

  const problems = rows.filter((row) => row.error).length;

  const apply = () => {
    const edits: Record<number, PriceEdit> = {};
    for (const row of rows) {
      if (row.productId == null || row.error) continue;
      edits[row.productId] = {
        basePrice: row.basePrice as number,
        salePrice: row.salePrice,
      };
    }
    onApply(edits);
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onCancel()}>
      <DialogContent className="max-h-[85vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import prices from CSV</DialogTitle>
          <DialogDescription>
            Columns: <code>slug</code> (or <code>sku</code>),{" "}
            <code>basePrice</code>, <code>salePrice</code>. Leave salePrice
            empty to clear it. Imported values go to the editor first — nothing
            is saved until you review.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="csv-file">CSV file</Label>
          <input
            id="csv-file"
            type="file"
            accept=".csv,text/csv"
            className="block w-full text-sm"
            onChange={async (event) => {
              const file = event.target.files?.[0];
              if (file) setText(await file.text());
              event.target.value = "";
            }}
          />
          <Label htmlFor="csv-text">…or paste it</Label>
          <textarea
            id="csv-text"
            rows={6}
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder={"slug,basePrice,salePrice\nadidas-own-the-run-jersey,1450,1150"}
            className="w-full border border-input p-3 font-mono text-xs"
          />
        </div>

        {headerError && (
          <p className="border border-red-300 bg-red-50 p-3 text-sm text-red-700">
            {headerError}
          </p>
        )}

        {rows.length > 0 && (
          <div className="overflow-x-auto">
            <p className="mb-2 text-xs font-bold uppercase tracking-widest">
              {rows.length} row{rows.length === 1 ? "" : "s"} · {problems}{" "}
              problem{problems === 1 ? "" : "s"}
            </p>
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-widest text-muted-foreground">
                  <th className="py-2 pr-4">Line</th>
                  <th className="py-2 pr-4">Slug / SKU</th>
                  <th className="py-2 pr-4">Base</th>
                  <th className="py-2 pr-4">Sale</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr
                    key={`${row.line}-${row.key}`}
                    className={
                      row.error
                        ? "border-b border-border bg-red-50"
                        : "border-b border-border"
                    }
                  >
                    <td className="py-2 pr-4 text-xs text-muted-foreground">
                      {row.line}
                    </td>
                    <td className="py-2 pr-4">{row.key}</td>
                    <td className="py-2 pr-4 tabular-nums">
                      {row.basePrice ?? "—"}
                    </td>
                    <td className="py-2 pr-4 tabular-nums">
                      {row.salePrice ?? "—"}
                    </td>
                    <td className="py-2 text-xs">
                      {row.error ? (
                        <span className="font-semibold text-red-600">
                          {row.error}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">Ready</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            type="button"
            disabled={rows.length === 0 || problems > 0}
            onClick={apply}
          >
            Apply {rows.length} row{rows.length === 1 ? "" : "s"} to the editor
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
