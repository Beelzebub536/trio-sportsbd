import { LoaderCircle } from "lucide-react";

import { cn } from "@/lib/utils";

/** Blurs a loading boundary's placeholder and puts a clear, accessible spinner in its centre. */
export default function LoadingSurface({
  children,
  className,
  label = "Loading",
  active = true,
}: {
  children: React.ReactNode;
  className?: string;
  label?: string;
  active?: boolean;
}) {
  if (!active) return children;

  return (
    <div
      className={cn("relative isolate overflow-hidden", className)}
      aria-busy="true"
      aria-label={label}
    >
      <div className="pointer-events-none select-none blur-[2px] opacity-60" aria-hidden="true">
        {children}
      </div>
      <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/55 px-4 backdrop-blur-[3px]">
        <div
          className="flex items-center gap-3 border border-white/80 bg-white/95 px-5 py-3 shadow-[0_8px_30px_rgba(15,23,42,0.14)] ring-1 ring-black/5"
          role="status"
        >
          <LoaderCircle className="h-5 w-5 animate-spin text-slate-900" aria-hidden="true" />
          <span className="text-xs font-bold uppercase tracking-widest text-slate-900">{label}</span>
        </div>
      </div>
    </div>
  );
}
