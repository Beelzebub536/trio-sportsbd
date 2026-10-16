import { Skeleton } from "@/components/ui/skeleton";

/** Shared skeleton for every product listing route. */
export default function ListingSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="mt-3 h-4 w-72" />

      <div className="mt-8 grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="space-y-2">
            <Skeleton className="aspect-[4/5] w-full" />
            <Skeleton className="h-3 w-3/4" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        ))}
      </div>
    </div>
  );
}
