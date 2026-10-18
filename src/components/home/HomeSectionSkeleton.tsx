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
        className="min-h-[45vh] sm:min-h-0"
        label="Loading featured banner"
      >
        <Skeleton className="aspect-[4/5] w-full sm:aspect-[16/9] lg:aspect-[21/9]" />
      </LoadingSurface>
    );
  }

  if (kind === "tiles") {
    return (
      <LoadingSurface className="min-h-[50vh]" label="Loading categories">
        <section className="mx-auto max-w-7xl px-4 py-8">
          <Skeleton className="mb-4 h-8 w-52" />
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="aspect-square" />
            ))}
          </div>
        </section>
      </LoadingSurface>
    );
  }

  if (kind === "row") {
    return (
      <LoadingSurface className="min-h-[50vh]" label="Loading products">
        <section className="mx-auto max-w-7xl px-4 py-8">
          <Skeleton className="mb-4 h-8 w-48" />
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="aspect-[4/5]" />
            ))}
          </div>
        </section>
      </LoadingSurface>
    );
  }

  return (
    <LoadingSurface className="min-h-48" label="Loading section">
      <section className="mx-auto max-w-7xl px-4 py-12">
        <Skeleton className="h-36 w-full" />
      </section>
    </LoadingSurface>
  );
}
