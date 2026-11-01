import Link from "next/link";

import ProductGrid from "@/components/product/ProductGrid";
import { getProductsByIds } from "@/lib/queries/products";
import { getWishlistProductIds } from "@/lib/queries/wishlist";
import { requireUser } from "@/lib/session";

export const metadata = { title: "My wishlist" };

export default async function AccountWishlistPage() {
  const session = await requireUser();
  const ids = await getWishlistProductIds(session.user.id);
  const products = await getProductsByIds(ids);

  return (
    <div>
      <h1 className="text-2xl font-bold leading-none md:text-3xl">
        My wishlist
      </h1>

      {products.length === 0 ? (
        <p className="mt-6 border border-border p-5 text-sm text-muted-foreground">
          Nothing saved yet. Tap the heart on any product to save it for later.
          {" "}
          <Link href="/shop" className="underline underline-offset-2">
            Browse the shop
          </Link>
          .
        </p>
      ) : (
        <div className="mt-6">
          <ProductGrid products={products} isAuthed savedIds={ids} />
        </div>
      )}
    </div>
  );
}
