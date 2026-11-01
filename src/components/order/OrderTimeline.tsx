import { cn } from "@/lib/utils";

const STEPS = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"];

export default function OrderTimeline({ status }: { status: string }) {
  if (status === "CANCELLED" || status === "RETURNED") {
    return (
      <p className="bg-secondary px-3 py-2 text-sm">
        This order was {status === "CANCELLED" ? "cancelled" : "returned"}.
      </p>
    );
  }

  const currentIndex = STEPS.indexOf(status);

  return (
    <ol className="flex flex-wrap items-center gap-y-3">
      {STEPS.map((step, index) => {
        const done = index <= currentIndex;
        return (
          <li key={step} className="flex items-center">
            <span className="flex items-center gap-2">
              <span
                className={cn(
                  "flex h-6 w-6 items-center justify-center text-[11px] font-bold",
                  done ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground",
                )}
              >
                {index + 1}
              </span>
              <span
                className={cn(
                  "text-sm font-semibold",
                  done ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {step.charAt(0) + step.slice(1).toLowerCase()}
              </span>
            </span>
            {index < STEPS.length - 1 && (
              <span
                aria-hidden
                className={cn(
                  "mx-3 h-px w-6 sm:w-10",
                  index < currentIndex ? "bg-primary" : "bg-border",
                )}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
