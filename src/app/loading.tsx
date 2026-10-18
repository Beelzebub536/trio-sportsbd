import { Skeleton } from "@/components/ui/skeleton";
import LoadingSurface from "@/components/ui/LoadingSurface";

/** Shared fallback for route segments without a more specific loading screen. */
export default function Loading() {
  return (
    <LoadingSurface className="min-h-[70vh]" label="Loading page">
      <main className="mx-auto max-w-7xl space-y-6 px-4 py-10">
        <Skeleton className="h-9 w-56" />
        <Skeleton className="h-5 w-80 max-w-full" />
        <div className="grid grid-cols-2 gap-4 pt-5 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div className="space-y-3" key={index}>
              <Skeleton className="aspect-[4/5] w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/3" />
            </div>
          ))}
        </div>
      </main>
    </LoadingSurface>
  );
}
