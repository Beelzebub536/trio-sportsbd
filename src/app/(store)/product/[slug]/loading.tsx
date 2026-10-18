import { Skeleton } from "@/components/ui/skeleton";

export default function ProductLoading() {
  return (
    <main
      className="mx-auto grid max-w-7xl gap-8 px-4 py-6 md:grid-cols-2"
      aria-busy="true"
      aria-label="Loading product details"
    >
      <div className="grid grid-cols-[64px_1fr] gap-3">
        <div className="space-y-3">
          {[0, 1, 2].map((item) => (
            <Skeleton key={item} className="aspect-[4/5] w-16" />
          ))}
        </div>
        <Skeleton className="aspect-[4/5] w-full" />
      </div>
      <section className="space-y-5 py-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-9 w-3/4" />
        <Skeleton className="h-6 w-28" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </section>
    </main>
  );
}
