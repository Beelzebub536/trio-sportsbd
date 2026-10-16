import { cn } from "@/lib/utils";

const LABELS: Record<string, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  RETURNED: "Returned",
};

const STYLES: Record<string, string> = {
  PENDING: "bg-secondary text-foreground",
  CONFIRMED: "bg-black text-white",
  PROCESSING: "bg-black text-white",
  SHIPPED: "bg-[var(--brand-accent)] text-black",
  DELIVERED: "bg-[var(--brand-accent)] text-black",
  CANCELLED: "bg-[var(--brand-sale)] text-white",
  RETURNED: "bg-[var(--brand-sale)] text-white",
};

export function statusLabel(status: string): string {
  return LABELS[status] ?? status;
}

export default function OrderStatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-block px-2.5 py-1 text-[11px] font-bold uppercase tracking-widest",
        STYLES[status] ?? "bg-secondary text-foreground",
      )}
    >
      {statusLabel(status)}
    </span>
  );
}
