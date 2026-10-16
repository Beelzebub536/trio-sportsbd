"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatBDT } from "@/lib/format";
import type { PriceDiff } from "@/lib/prices";

const price = (value: number | null) =>
  value == null ? "—" : formatBDT(value);

export default function PriceReviewDialog({
  open,
  mode,
  diff,
  label,
  busy,
  warnings,
  onLabelChange,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  mode: "stage" | "save";
  diff: PriceDiff[];
  label: string;
  busy: boolean;
  warnings?: number;
  onLabelChange: (value: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const errors = diff.filter((row) => row.error);

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onCancel()}>
      <DialogContent className="max-h-[85vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "save" ? "Review and save" : "Preview changes"}
          </DialogTitle>
          <DialogDescription>
            {diff.length} product{diff.length === 1 ? "" : "s"} will change.
            {errors.length > 0
              ? ` Fix ${errors.length} problem${errors.length === 1 ? "" : "s"} before saving.`
              : " Old price → new price is shown for every row."}
          </DialogDescription>
        </DialogHeader>

        {diff.length === 0 ? (
          <p className="border border-border p-4 text-sm text-muted-foreground">
            No changes yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-widest text-muted-foreground">
                  <th className="py-2 pr-4">Product</th>
                  <th className="py-2 pr-4">Base price</th>
                  <th className="py-2 pr-4">Sale price</th>
                  <th className="py-2">Note</th>
                </tr>
              </thead>
              <tbody>
                {diff.map((row) => (
                  <tr
                    key={row.id}
                    className={
                      row.error
                        ? "border-b border-border bg-red-50"
                        : "border-b border-border"
                    }
                  >
                    <td className="py-2 pr-4">
                      <span className="block font-semibold">{row.name}</span>
                      <span className="block text-xs text-muted-foreground">
                        /{row.slug}
                      </span>
                    </td>
                    <td className="py-2 pr-4 tabular-nums">
                      {price(row.oldBase)} →{" "}
                      <span className="font-semibold">{price(row.newBase)}</span>
                    </td>
                    <td className="py-2 pr-4 tabular-nums">
                      {price(row.oldSale)} →{" "}
                      <span className="font-semibold">{price(row.newSale)}</span>
                    </td>
                    <td className="py-2 text-xs">
                      {row.error ? (
                        <span className="font-semibold text-red-600">
                          {row.error}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">OK</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {mode === "save" && (
          <div className="space-y-2">
            <Label htmlFor="batch-label">Batch label</Label>
            <Input
              id="batch-label"
              value={label}
              onChange={(event) => onLabelChange(event.target.value)}
              placeholder="Eid sale — jerseys"
            />
            <p className="text-xs text-muted-foreground">
              Used in the price history so you can undo it later.
            </p>
          </div>
        )}

        {warnings != null && warnings > 0 && (
          <p className="border border-amber-300 bg-amber-50 p-3 text-xs">
            {warnings} sale price{warnings === 1 ? "" : "s"} will be removed
            because the new base price is no longer higher.
          </p>
        )}

        <DialogFooter className="gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            type="button"
            disabled={
              busy ||
              diff.length === 0 ||
              errors.length > 0 ||
              (mode === "save" && label.trim().length < 2)
            }
            onClick={onConfirm}
          >
            {busy
              ? "Saving…"
              : mode === "save"
                ? `Save ${diff.length} change${diff.length === 1 ? "" : "s"}`
                : "Apply to the editor"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
