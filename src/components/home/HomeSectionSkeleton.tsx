import { Skeleton } from "@/components/ui/skeleton";
import LoadingSurface from "@/components/ui/LoadingSurface";

export default function HomeSectionSkeleton({
  kind,
}: {
  kind: "hero" | "tiles" | "row" | "cta";
}) {
  if (kind === "hero") {
    return (
      <LoadingSurface
        className="mx-auto max-w-7xl px-4"
        label="Loading featured collections"
      >
        <Skeleton className="aspect-[16/10] w-full rounded-3xl sm:aspect-[16/9] lg:aspect-[21/9]" />
      </LoadingSurface>
    );
  }

  if (kind === "tiles") {
    return (
      <LoadingSurface className="min-h-[50vh]" label="Loading categories">
        <section className="mx-auto max-w-7xl px-4 pt-16 md:pt-24">
          <Skeleton className="h-10 w-64" />
          <div className="mt-6 grid grid-cols-2 gap-2 md:gap-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="aspect-[3/4] rounded-2xl" />
            ))}
          </div>
        </section>
      </LoadingSurface>
    );
  }

  if (kind === "row") {
    return (
      <LoadingSurface className="min-h-[50vh]" label="Loading products">
        <section className="mx-auto max-w-7xl px-4 py-12 md:py-16">
          <Skeleton className="mb-5 h-10 w-56" />
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="aspect-[4/5] rounded-2xl" />
            ))}
          </div>
        </section>
      </LoadingSurface>
    );
  }

  return (
    <LoadingSurface className="min-h-48" label="Loading section">
      <section className="mx-auto max-w-7xl px-4 py-12 md:py-16">
        <Skeleton className="h-44 w-full rounded-3xl" />
      </section>
    </LoadingSurface>
  );
}
