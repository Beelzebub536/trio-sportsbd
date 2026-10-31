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
  CONFIRMED: "bg-primary text-primary-foreground",
  PROCESSING: "bg-primary text-primary-foreground",
  SHIPPED: "bg-primary text-primary-foreground",
  DELIVERED: "bg-primary text-primary-foreground",
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
        "inline-block px-2.5 py-1 text-xs font-semibold",
        STYLES[status] ?? "bg-secondary text-foreground",
      )}
    >
      {statusLabel(status)}
    </span>
  );
}
