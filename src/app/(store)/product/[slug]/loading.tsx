import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 lg:grid-cols-2">
      <Skeleton className="aspect-[4/5] w-full" />
      <div className="space-y-4">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-11 w-48" />
      </div>
    </div>
  );
}
