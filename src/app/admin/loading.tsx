import { Skeleton } from "@/components/ui/skeleton";
import LoadingSurface from "@/components/ui/LoadingSurface";

export default function Loading() {
  return (
    <LoadingSurface className="min-h-[70vh]" label="Loading admin dashboard">
      <div className="space-y-6">
        <Skeleton className="h-9 w-56" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-28 w-full" />
          ))}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    </LoadingSurface>
  );
}
