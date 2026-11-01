"use client";

import Image from "next/image";
import Link from "next/link";

import { formatBDT } from "@/lib/format";
import { getListingImageUrl } from "@/lib/image-url";
import type { ProductCardData } from "@/lib/queries/products";

export default function CachedListingPreview({
  products,
  onRemove,
}: {
  products: ProductCardData[];
  onRemove?: (productId: number) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <article key={product.id}>
          <Link
            href={`/product/${product.slug}`}
            className="relative block aspect-[4/5] overflow-hidden rounded-2xl bg-card"
            aria-label={product.name}
          >
            {product.image && (
              <Image
                src={getListingImageUrl(product.image)}
                alt={product.name}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                quality={60}
                className="object-cover"
              />
            )}
          </Link>
          <p className="mt-2 text-xs font-semibold leading-snug">
            {product.name}
          </p>
          <p className="text-xs text-muted-foreground">{product.categoryName}</p>
          <p className="pt-1 text-sm font-semibold">
            {formatBDT(product.salePrice ?? product.basePrice)}
          </p>
          {onRemove && (
            <button
              type="button"
              onClick={() => onRemove(product.id)}
              className="mt-2 text-xs underline underline-offset-2"
            >
              Remove from wishlist
            </button>
          )}
        </article>
      ))}
    </div>
  );
}
