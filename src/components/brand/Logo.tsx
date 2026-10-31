import { cn } from "@/lib/utils";

/** Placeholder wordmark; swap for the real logo when it exists. */
export default function Logo({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "flex items-baseline gap-1 font-display text-2xl font-extrabold leading-none tracking-tight",
        className,
      )}
    >
      Trio
      <span className="text-primary">Sports</span>
    </span>
  );
}
