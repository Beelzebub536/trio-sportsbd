import { Skeleton } from "@/components/ui/skeleton";
import LoadingSurface from "@/components/ui/LoadingSurface";

/** Shared skeleton for every product listing route. */
export default function ListingSkeleton() {
  return (
    <LoadingSurface className="min-h-[70vh]" label="Loading products">
      <div className="floodlight h-40 md:h-56" />
      <div className="mx-auto max-w-7xl px-4 py-6">
        <Skeleton className="h-5 w-40" />

        <div className="mt-8 grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <Skeleton className="aspect-[4/5] w-full rounded-2xl" />
              <Skeleton className="h-3 w-3/4" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          ))}
        </div>
      </div>
    </LoadingSurface>
  );
}
