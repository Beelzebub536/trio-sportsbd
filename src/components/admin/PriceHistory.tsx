"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { undoBatch } from "@/actions/admin/prices";
import { Button } from "@/components/ui/button";
import { formatBDT } from "@/lib/format";

export type HistoryChange = {
  id: number;
  productName: string;
  field: string;
  oldValue: number | null;
  newValue: number | null;
};

export type HistoryBatch = {
  id: number;
  label: string;
  createdByName: string;
  createdAtLabel: string;
  revertedAtLabel: string | null;
  productCount: number;
  changes: HistoryChange[];
};

const price = (value: number | null) =>
  value == null ? "—" : formatBDT(value);

export default function PriceHistory({ batches }: { batches: HistoryBatch[] }) {
  const router = useRouter();
  const [expanded, setExpanded] = useState<number | null>(null);
  const [busy, setBusy] = useState<number | null>(null);

  const undo = async (batch: HistoryBatch) => {
    if (
      !window.confirm(
        `Undo “${batch.label}”? This restores the prices from before that batch.`,
      )
    ) {
      return;
    }

    setBusy(batch.id);
    const result = await undoBatch(batch.id);
    setBusy(null);

    if (!result.ok) {
      toast.error(result.error ?? "Could not undo the batch.");
      return;
    }

    toast.success(
      result.skipped
        ? `Undone. ${result.skipped} product(s) skipped (changed by a newer batch).`
        : "Batch undone — prices restored.",
    );
    router.refresh();
  };

  if (batches.length === 0) {
    return (
      <p className="border border-border p-5 text-sm text-muted-foreground">
        No price batches yet.{" "}
        <Link href="/admin/prices" className="underline underline-offset-2">
          Open the price editor
        </Link>
        .
      </p>
    );
  }

  return (
    <ul className="divide-y divide-border border-y border-border">
      {batches.map((batch) => (
        <li key={batch.id} className="py-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="font-semibold uppercase">{batch.label}</p>
              <p className="text-xs text-muted-foreground">
                {batch.createdByName} · {batch.createdAtLabel} ·{" "}
                {batch.productCount} product
                {batch.productCount === 1 ? "" : "s"}
                {batch.revertedAtLabel
                  ? ` · undone ${batch.revertedAtLabel}`
                  : ""}
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setExpanded((current) =>
                  current === batch.id ? null : batch.id,
                )
              }
            >
              {expanded === batch.id ? "Hide changes" : "View changes"}
            </Button>

            <Button
              variant="outline"
              size="sm"
              disabled={busy === batch.id || batch.revertedAtLabel != null}
              onClick={() => undo(batch)}
            >
              {batch.revertedAtLabel ? "Undone" : "Undo batch"}
            </Button>
          </div>

          {expanded === batch.id && (
            <div className="mt-3 overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase tracking-widest text-muted-foreground">
                    <th className="py-2 pr-4">Product</th>
                    <th className="py-2 pr-4">Field</th>
                    <th className="py-2 pr-4">Old</th>
                    <th className="py-2">New</th>
                  </tr>
                </thead>
                <tbody>
                  {batch.changes.map((change) => (
                    <tr key={change.id} className="border-b border-border">
                      <td className="py-2 pr-4">{change.productName}</td>
                      <td className="py-2 pr-4 text-xs uppercase tracking-widest">
                        {change.field}
                      </td>
                      <td className="py-2 pr-4 tabular-nums">
                        {price(change.oldValue)}
                      </td>
                      <td className="py-2 tabular-nums font-semibold">
                        {price(change.newValue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
