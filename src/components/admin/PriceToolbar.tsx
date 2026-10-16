"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  OPERATION_LABELS,
  ROUND_STEPS,
  type BulkOperation,
  type BulkOperationKind,
} from "@/lib/prices";

const NEEDS_VALUE: BulkOperationKind[] = [
  "setBase",
  "increasePercent",
  "decreasePercent",
  "increaseAmount",
  "decreaseAmount",
  "salePercentOff",
  "roundTo",
];

export default function PriceToolbar({
  selectedCount,
  onPreview,
}: {
  selectedCount: number;
  onPreview: (operation: BulkOperation) => void;
}) {
  const [kind, setKind] = useState<BulkOperationKind>("increasePercent");
  const [value, setValue] = useState("10");

  const needsValue = NEEDS_VALUE.includes(kind);
  const numeric = Number(value);
  const valid =
    !needsValue ||
    (Number.isFinite(numeric) &&
      numeric > 0 &&
      (kind !== "roundTo" || ROUND_STEPS.includes(numeric as 5 | 10 | 50)));

  const hint =
    kind === "roundTo"
      ? "Nearest 5, 10 or 50"
      : kind === "salePercentOff"
        ? "Between 1 and 90"
        : undefined;

  return (
    <div className="flex flex-wrap items-end gap-3 border border-border bg-secondary/40 p-4">
      <div className="space-y-2">
        <Label htmlFor="op-kind">Bulk operation</Label>
        <Select
          value={kind}
          onValueChange={(next) => setKind(next as BulkOperationKind)}
        >
          <SelectTrigger id="op-kind" className="w-64">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(OPERATION_LABELS) as BulkOperationKind[]).map(
              (option) => (
                <SelectItem key={option} value={option}>
                  {OPERATION_LABELS[option]}
                </SelectItem>
              ),
            )}
          </SelectContent>
        </Select>
      </div>

      {needsValue && (
        <div className="space-y-2">
          <Label htmlFor="op-value">
            {kind === "roundTo" ? "Step" : "Value"}
          </Label>
          <Input
            id="op-value"
            type="number"
            min={1}
            className="w-28"
            value={value}
            onChange={(event) => setValue(event.target.value)}
          />
          {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
        </div>
      )}

      <Button
        type="button"
        disabled={selectedCount === 0 || !valid}
        onClick={() => onPreview({ kind, value: needsValue ? numeric : 0 })}
      >
        Preview on {selectedCount} row{selectedCount === 1 ? "" : "s"}
      </Button>

      <p className="text-xs text-muted-foreground">
        Nothing is saved until you review and save the batch.
      </p>
    </div>
  );
}
