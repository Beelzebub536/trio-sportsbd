import { Skeleton } from "@/components/ui/skeleton";

export default function ProductCardSkeleton() {
  return (
    <div className="flex flex-col">
      <Skeleton className="aspect-[4/5] w-full" />
      <div className="mt-2 space-y-2">
        <Skeleton className="h-3 w-4/5" />
        <Skeleton className="h-3 w-2/5" />
        <Skeleton className="h-4 w-1/3" />
      </div>
    </div>
  );
}
