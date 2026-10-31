"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Minus, Plus, ShoppingBag } from "lucide-react";
import { toast } from "sonner";

import ProductGallery, {
  type GalleryImage,
} from "@/components/product/ProductGallery";
import StickyBuyBar from "@/components/product/StickyBuyBar";
import WishlistButton from "@/components/product/WishlistButton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { discountPercent, effectivePrice, formatBDT, toWhatsAppNumber } from "@/lib/format";
import { useCartStore } from "@/stores/cart";
import { cn } from "@/lib/utils";

export type PurchaseVariant = {
  id: number;
  size: string;
  color: string;
  colorHex: string | null;
  stock: number;
};

const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "XXL", "3XL"];

const sizeRank = (size: string): number => {
  const index = SIZE_ORDER.indexOf(size.toUpperCase());
  return index === -1 ? 999 : index;
};

export default function ProductDetail({
  product,
  variants,
  images,
  isAuthed,
  saved,
  whatsappNumber,
}: {
  product: {
    id: number;
    name: string;
    slug: string;
    description: string;
    brand: string | null;
    categoryName: string;
    basePrice: number;
    salePrice: number | null;
  };
  variants: PurchaseVariant[];
  images: GalleryImage[];
  isAuthed: boolean;
  saved: boolean;
  whatsappNumber: string;
}) {
  const add = useCartStore((state) => state.add);

  const colors = useMemo(() => {
    const map = new Map<string, string | null>();
    variants.forEach((variant) => {
      if (!map.has(variant.color)) map.set(variant.color, variant.colorHex);
    });
    return [...map.entries()].map(([name, hex]) => ({ name, hex }));
  }, [variants]);

  const sizes = useMemo(() => {
    const unique = [...new Set(variants.map((variant) => variant.size))];
    return unique.sort((a, b) => sizeRank(a) - sizeRank(b));
  }, [variants]);

  const [selectedColor, setSelectedColor] = useState(colors[0]?.name ?? "");
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const sizePickerRef = useRef<HTMLDivElement>(null);

  const discount = discountPercent(product.basePrice, product.salePrice);
  const price = effectivePrice(product.basePrice, product.salePrice);

  const stockForSize = (size: string): number =>
    variants.find(
      (variant) => variant.color === selectedColor && variant.size === size,
    )?.stock ?? 0;

  const currentVariant = variants.find(
    (variant) => variant.color === selectedColor && variant.size === selectedSize,
  );

  const currentStock = currentVariant?.stock ?? 0;
  const imageForColor =
    images.find((image) => image.color === selectedColor)?.url ?? images[0]?.url ?? null;

  const handleAdd = () => {
    if (!currentVariant || currentStock <= 0) {
      toast.error("Please choose an available size.");
      return;
    }
    add(
      {
        variantId: currentVariant.id,
        productId: product.id,
        name: product.name,
        slug: product.slug,
        size: currentVariant.size,
        color: currentVariant.color,
        image: imageForColor,
        unitPrice: price,
      },
      qty,
    );
    toast.success(`${product.name} added to your bag`);
  };

  const ctaLabel = !selectedSize
    ? "Select a size"
    : currentStock <= 0
      ? "Out of stock"
      : "Add to bag";

  const whatsappMessage = encodeURIComponent(
    `Hi Trio Sports BD, I'm interested in "${product.name}"${
      selectedColor ? ` (${selectedColor}${selectedSize ? ` / ${selectedSize}` : ""})` : ""
    }. Is it in stock?`,
  );

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
      <ProductGallery
        key={selectedColor}
        images={images}
        selectedColor={selectedColor}
        productName={product.name}
      />

      <div>
        {product.brand && (
          <p className="text-sm font-semibold text-primary">
            {product.brand}
          </p>
        )}
        <h1 className="mt-1 text-5xl md:text-6xl">
          {product.name}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">{product.categoryName}</p>

        <div className="price mt-5 flex flex-wrap items-center gap-3">
          <span
            className={cn(
              "text-3xl font-bold",
              discount > 0 && "text-sale",
            )}
          >
            {formatBDT(price)}
          </span>
          {discount > 0 && (
            <>
              <span className="text-muted-foreground line-through">
                {formatBDT(product.basePrice)}
              </span>
              <span className="rounded-full bg-sale px-2.5 py-1 text-xs font-bold text-white">
                -{discount}%
              </span>
            </>
          )}
        </div>

        {colors.length > 0 && (
          <div className="mt-6">
            <p className="text-sm font-semibold">
              Colour: <span className="font-normal text-muted-foreground">{selectedColor}</span>
            </p>
            <ul className="mt-2 flex flex-wrap gap-2">
              {colors.map((color) => (
                <li key={color.name}>
                  <button
                    type="button"
                    aria-label={`Colour ${color.name}`}
                    aria-pressed={selectedColor === color.name}
                    onClick={() => {
                      setSelectedColor(color.name);
                      setSelectedSize(null);
                      setQty(1);
                    }}
                    className={cn(
                      "press h-11 w-11 border",
                      selectedColor === color.name
                        ? "border-foreground ring-2 ring-primary ring-offset-2"
                        : "border-border",
                    )}
                    style={{ backgroundColor: color.hex ?? "#ffffff" }}
                  />
                </li>
              ))}
            </ul>
          </div>
        )}

        <div ref={sizePickerRef} className="mt-6 scroll-mt-24">
          <p className="text-sm font-semibold">Size</p>
          <ul className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4">
            {sizes.map((size) => {
              const stock = stockForSize(size);
              const disabled = stock <= 0;
              return (
                <li key={size}>
                  <button
                    type="button"
                    disabled={disabled}
                    aria-pressed={selectedSize === size}
                    onClick={() => {
                      setSelectedSize(size);
                      setQty(1);
                    }}
                    className={cn(
                      "press h-12 w-full border text-sm font-bold uppercase",
                      disabled
                        ? "cursor-not-allowed border-border bg-secondary text-muted-foreground line-through"
                        : selectedSize === size
                          ? "border-primary bg-primary text-white"
                          : "border-border hover:border-foreground",
                    )}
                  >
                    {size}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {currentVariant && currentStock > 0 && currentStock <= 5 && (
          <p className="mt-3 text-sm font-semibold text-sale">
            Only {currentStock} left
          </p>
        )}

        <div className="mt-6 flex items-stretch gap-2">
          <div className="flex items-center border border-border">
            <button
              type="button"
              aria-label="Decrease quantity"
              className="press flex w-11 items-center justify-center hover:bg-secondary"
              onClick={() => setQty((value) => Math.max(1, value - 1))}
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="price w-8 text-center text-base font-semibold">{qty}</span>
            <button
              type="button"
              aria-label="Increase quantity"
              className="press flex w-11 items-center justify-center hover:bg-secondary"
              onClick={() =>
                setQty((value) =>
                  currentStock > 0 ? Math.min(currentStock, value + 1) : value + 1,
                )
              }
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          <Button
            type="button"
            onClick={handleAdd}
            disabled={!selectedSize || currentStock <= 0}
            className="h-14 min-w-0 flex-1 px-3"
          >
            <ShoppingBag className="h-5 w-5" />
            {ctaLabel}
          </Button>

          <WishlistButton
            productId={product.id}
            saved={saved}
            isAuthed={isAuthed}
            className="h-auto w-14 rounded-none border border-border shadow-none"
          />
        </div>

        <a
          href={`https://wa.me/${toWhatsAppNumber(whatsappNumber)}?text=${whatsappMessage}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-block py-2 text-sm font-semibold text-primary underline underline-offset-4 hover:decoration-2"
        >
          Ask about this product on WhatsApp
        </a>

        <Accordion type="single" collapsible className="mt-8 border-t border-border">
          <AccordionItem value="description">
            <AccordionTrigger className="font-display text-xl font-bold uppercase">
              Description
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground">
              {product.description}
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="size-guide">
            <AccordionTrigger className="font-display text-xl font-bold uppercase">
              Size guide
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground">
              Sizes run true to standard athletic fit. If you are between sizes,
              go one size up.{" "}
              <Link href="/size-guide" className="underline underline-offset-4">
                View the full size guide
              </Link>
              .
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="shipping" className="border-b-0">
            <AccordionTrigger className="font-display text-xl font-bold uppercase">
              Shipping &amp; returns
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground">
              Delivered in 1–2 days inside Dhaka and 2–4 days elsewhere. Pay cash on
              delivery; any online payment options are shown at checkout. Returns
              accepted within 7 days for unused items with tags.{" "}
              <Link href="/shipping-returns" className="underline underline-offset-4">
                Read the policy
              </Link>
              .
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      <StickyBuyBar
        price={price}
        onSale={discount > 0}
        label={ctaLabel}
        disabled={Boolean(selectedSize) && currentStock <= 0}
        onClick={
          selectedSize
            ? handleAdd
            : () => sizePickerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
        }
      />
    </div>
  );
}
