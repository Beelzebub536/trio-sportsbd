import { Skeleton } from "@/components/ui/skeleton";

export default function HomeSectionSkeleton({
  kind,
}: {
  kind: "hero" | "tiles" | "row" | "cta";
}) {
  if (kind === "hero") {
    return <Skeleton className="aspect-[4/5] w-full sm:aspect-[16/9] lg:aspect-[21/9]" />;
  }

  if (kind === "tiles") {
    return (
      <section className="mx-auto max-w-7xl px-4 py-8">
        <Skeleton className="mb-4 h-8 w-52" />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="aspect-square" />
          ))}
        </div>
      </section>
    );
  }

  if (kind === "row") {
    return (
      <section className="mx-auto max-w-7xl px-4 py-8">
        <Skeleton className="mb-4 h-8 w-48" />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="aspect-[4/5]" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-12">
      <Skeleton className="h-36 w-full" />
    </section>
  );
}
