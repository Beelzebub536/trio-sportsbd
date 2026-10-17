import { formatBDT } from "@/lib/format";

export type SummaryLine = {
  variantId: number;
  name: string;
  size: string;
  color: string;
  unitPrice: number;
  qty: number;
};

export default function OrderSummary({
  lines,
  subtotal,
  shippingFee,
  shippingPending,
  total,
  advanceAmount,
  advancePercent,
}: {
  lines: SummaryLine[];
  subtotal: number | null;
  shippingFee: number | null;
  shippingPending: boolean;
  total: number | null;
  advanceAmount: number | null;
  advancePercent: number;
}) {
  const balance =
    total == null || advanceAmount == null
      ? null
      : Math.max(0, total - advanceAmount);

  return (
    <div className="border border-border p-5">
      <h2 className="text-sm font-bold uppercase tracking-widest">
        Order summary
      </h2>

      <ul className="mt-4 space-y-3">
        {lines.map((line) => (
          <li key={line.variantId} className="flex justify-between gap-3 text-sm">
            <span className="min-w-0">
              <span className="block truncate font-medium">{line.name}</span>
              <span className="block text-xs text-muted-foreground">
                {line.color} · {line.size} · ×{line.qty}
              </span>
            </span>
            <span className="shrink-0 font-semibold">
              {formatBDT(line.unitPrice * line.qty)}
            </span>
          </li>
        ))}
      </ul>

      <dl className="mt-5 space-y-2 border-t border-border pt-4 text-sm">
        <div className="flex justify-between">
          <dt>Subtotal</dt>
          <dd className="font-semibold">
            {subtotal == null ? "Checking…" : formatBDT(subtotal)}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt>Delivery</dt>
          <dd className="font-semibold">
            {shippingFee == null
              ? shippingPending
                ? "Checking…"
                : "Select division"
              : shippingFee === 0
                ? "Free"
                : formatBDT(shippingFee)}
          </dd>
        </div>
        <div className="flex justify-between border-t border-border pt-2 text-base">
          <dt className="font-bold uppercase">Total</dt>
          <dd className="font-bold">{total == null ? "—" : formatBDT(total)}</dd>
        </div>
      </dl>

      <div className="mt-4 bg-secondary p-3 text-sm">
        <p className="font-semibold">
          Pay {advanceAmount == null ? "—" : formatBDT(advanceAmount)} now ({advancePercent}%)
        </p>
        <p className="mt-1 text-muted-foreground">
          Remaining {balance == null ? "—" : formatBDT(balance)} in cash on delivery.
        </p>
      </div>
    </div>
  );
}
