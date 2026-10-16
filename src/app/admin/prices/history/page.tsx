import Link from "next/link";

import PriceHistory, {
  type HistoryBatch,
} from "@/components/admin/PriceHistory";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";

export default async function AdminPriceHistoryPage() {
  await requireAdmin();

  const batches = await prisma.priceBatch.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      priceChanges: { include: { product: { select: { name: true } } } },
    },
  });

  const userIds = [...new Set(batches.map((batch) => batch.createdById))];
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, name: true },
  });
  const names = new Map(users.map((user) => [user.id, user.name]));

  const history: HistoryBatch[] = batches.map((batch) => ({
    id: batch.id,
    label: batch.label,
    createdByName: names.get(batch.createdById) ?? "Unknown admin",
    createdAtLabel: batch.createdAt.toLocaleString("en-GB"),
    revertedAtLabel: batch.revertedAt
      ? batch.revertedAt.toLocaleString("en-GB")
      : null,
    productCount: new Set(batch.priceChanges.map((change) => change.productId))
      .size,
    changes: batch.priceChanges.map((change) => ({
      id: change.id,
      productName: change.product.name,
      field: change.field,
      oldValue: change.oldValue,
      newValue: change.newValue,
    })),
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            href="/admin/prices"
            className="text-xs font-bold uppercase tracking-widest underline underline-offset-4"
          >
            ← Bulk prices
          </Link>
          <h1 className="mt-2 text-2xl font-bold uppercase leading-none md:text-3xl">
            Price history
          </h1>
        </div>
      </div>

      <p className="max-w-2xl text-sm text-muted-foreground">
        Every bulk change is stored as a batch so it can be undone. Undo skips
        products that a newer batch has already touched.
      </p>

      <PriceHistory batches={history} />
    </div>
  );
}
