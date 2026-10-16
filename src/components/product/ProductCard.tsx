import Image from "next/image";
import Link from "next/link";

import WishlistButton from "@/components/product/WishlistButton";
import { discountPercent, effectivePrice, formatBDT } from "@/lib/format";
import type { ProductCardData } from "@/lib/queries/products";
import { cn } from "@/lib/utils";

const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

const isNewProduct = (createdAt: Date): boolean =>
  Date.now() - new Date(createdAt).getTime() < THIRTY_DAYS;

export default function ProductCard({
  product,
  isAuthed = false,
  saved = false,
  priority = false,
}: {
  product: ProductCardData;
  isAuthed?: boolean;
  saved?: boolean;
  priority?: boolean;
}) {
  const discount = discountPercent(product.basePrice, product.salePrice);
  const price = effectivePrice(product.basePrice, product.salePrice);
  const showNew = discount === 0 && isNewProduct(product.createdAt);

  return (
    <article className="group relative flex flex-col">
      <Link
        href={`/product/${product.slug}`}
        className="relative block aspect-[4/5] overflow-hidden bg-secondary"
        aria-label={product.name}
      >
        {product.image ? (
          <>
            <Image
              src={product.image}
              alt={product.name}
              fill
              priority={priority}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className={cn(
                "object-cover transition-opacity duration-200",
                product.secondImage && "group-hover:opacity-0",
              )}
            />
            {product.secondImage && (
              <Image
                src={product.secondImage}
                alt=""
                aria-hidden
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover opacity-0 transition-opacity duration-200 group-hover:opacity-100"
              />
            )}
          </>
        ) : (
          <span className="flex h-full items-center justify-center text-xs uppercase tracking-widest text-muted-foreground">
            No image
          </span>
        )}

        {discount > 0 && (
          <span className="absolute left-0 top-2 bg-[var(--brand-sale)] px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white">
            -{discount}%
          </span>
        )}
        {showNew && (
          <span className="absolute left-0 top-2 bg-black px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white">
            New
          </span>
        )}
      </Link>

      <WishlistButton
        productId={product.id}
        saved={saved}
        isAuthed={isAuthed}
        className="absolute right-2 top-2"
      />

      <div className="mt-2 space-y-0.5">
        <h3 className="text-xs font-semibold uppercase leading-snug tracking-wide">
          <Link href={`/product/${product.slug}`} className="hover:underline">
            {product.name}
          </Link>
        </h3>
        <p className="text-xs text-muted-foreground">{product.categoryName}</p>
        <p className="flex items-center gap-2 pt-0.5 text-sm">
          <span
            className={cn(
              "font-semibold",
              discount > 0 && "text-[var(--brand-sale)]",
            )}
          >
            {formatBDT(price)}
          </span>
          {discount > 0 && (
            <span className="text-xs text-muted-foreground line-through">
              {formatBDT(product.basePrice)}
            </span>
          )}
        </p>
        {product.colorCount > 0 && (
          <p className="text-xs text-muted-foreground">
            {product.colorCount} colour{product.colorCount === 1 ? "" : "s"}
          </p>
        )}
      </div>
    </article>
  );
}
