import Image from "next/image";
import Link from "next/link";

import WishlistButton from "@/components/product/WishlistButton";
import { discountPercent, effectivePrice, formatBDT } from "@/lib/format";
import type { ProductCardData } from "@/lib/queries/products";
import { getListingImageUrl } from "@/lib/image-url";
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
        className="press relative block aspect-[4/5] overflow-hidden bg-secondary"
        aria-label={product.name}
      >
        {product.image ? (
          <>
            <Image
              src={getListingImageUrl(product.image)}
              alt={product.name}
              fill
              priority={priority}
              quality={60}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className={cn(
                "object-cover transition duration-300 md:group-hover:scale-[1.04]",
                product.secondImage && "group-hover:opacity-0",
              )}
            />
            {product.secondImage && (
              <Image
                src={getListingImageUrl(product.secondImage)}
                alt=""
                aria-hidden
                quality={60}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover opacity-0 transition duration-300 md:group-hover:scale-[1.04] group-hover:opacity-100"
              />
            )}
          </>
        ) : (
          <span className="flex h-full items-center justify-center text-sm text-muted-foreground">
            No image yet
          </span>
        )}

        {discount > 0 && (
          <span className="price absolute left-2 top-2 rounded-full bg-sale px-2.5 py-1 text-xs font-bold text-white">
            -{discount}%
          </span>
        )}
        {showNew && (
          <span className="absolute left-2 top-2 rounded-full bg-primary px-2.5 py-1 text-xs font-bold text-white">
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

      <div className="mt-3 space-y-1">
        <h3 className="font-display text-lg font-bold uppercase leading-[1.05] md:text-xl">
          <Link href={`/product/${product.slug}`} className="hover:text-primary">
            {product.name}
          </Link>
        </h3>
        <p className="text-[13px] text-muted-foreground">{product.categoryName}</p>
        <p className="price flex items-baseline gap-2 text-base">
          <span
            className={cn(
              "font-bold",
              discount > 0 && "text-sale",
            )}
          >
            {formatBDT(price)}
          </span>
          {discount > 0 && (
            <span className="text-sm text-muted-foreground line-through">
              {formatBDT(product.basePrice)}
            </span>
          )}
        </p>
        {product.colorCount > 1 && (
          <p className="text-[13px] text-muted-foreground">
            {product.colorCount} colour{product.colorCount === 1 ? "" : "s"}
          </p>
        )}
      </div>
    </article>
  );
}
