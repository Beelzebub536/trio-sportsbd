"use client";

import Link from "next/link";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { GENDER_OPTIONS } from "@/lib/listing-params";
import type { Facets } from "@/lib/queries/products";

export type FilterCurrent = {
  category: string[];
  gender: string[];
  size: string[];
  color: string[];
  brand: string[];
  minPrice: string;
  maxPrice: string;
  onSale: boolean;
};

export default function FilterPanel({
  action,
  facets,
  categoryOptions,
  current,
  sort,
  showGender,
  showOnSale,
}: {
  action: string;
  facets: Facets;
  categoryOptions: Array<{ name: string; slug: string }>;
  current: FilterCurrent;
  sort: string;
  showGender: boolean;
  showOnSale: boolean;
}) {
  return (
    <form method="get" action={action} className="text-sm">
      <input type="hidden" name="sort" value={sort} />

      <Accordion
        type="multiple"
        defaultValue={["category", "gender", "size", "color", "price", "brand", "sale"]}
      >
        {categoryOptions.length > 0 && (
          <AccordionItem value="category">
            <AccordionTrigger className="text-xs font-bold uppercase tracking-widest">
              Category
            </AccordionTrigger>
            <AccordionContent>
              <ul className="space-y-2">
                {categoryOptions.map((option) => (
                  <li key={option.slug}>
                    <label className="flex cursor-pointer items-center gap-2">
                      <input
                        type="checkbox"
                        name="category"
                        value={option.slug}
                        defaultChecked={current.category.includes(option.slug)}
                        className="h-4 w-4 accent-black"
                      />
                      <span>{option.name}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        )}

        {showGender && (
          <AccordionItem value="gender">
            <AccordionTrigger className="text-xs font-bold uppercase tracking-widest">
              Gender
            </AccordionTrigger>
            <AccordionContent>
              <ul className="space-y-2">
                {GENDER_OPTIONS.map((option) => (
                  <li key={option.value}>
                    <label className="flex cursor-pointer items-center gap-2">
                      <input
                        type="checkbox"
                        name="gender"
                        value={option.value}
                        defaultChecked={current.gender.includes(option.value)}
                        className="h-4 w-4 accent-black"
                      />
                      <span>{option.label}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        )}

        {facets.sizes.length > 0 && (
          <AccordionItem value="size">
            <AccordionTrigger className="text-xs font-bold uppercase tracking-widest">
              Size
            </AccordionTrigger>
            <AccordionContent>
              <ul className="flex flex-wrap gap-2">
                {facets.sizes.map((size) => (
                  <li key={size}>
                    <label className="flex cursor-pointer items-center gap-1.5 border border-border px-2 py-1 text-xs has-[:checked]:border-black has-[:checked]:bg-black has-[:checked]:text-white">
                      <input
                        type="checkbox"
                        name="size"
                        value={size}
                        defaultChecked={current.size.includes(size)}
                        className="sr-only"
                      />
                      <span>{size}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        )}

        {facets.colors.length > 0 && (
          <AccordionItem value="color">
            <AccordionTrigger className="text-xs font-bold uppercase tracking-widest">
              Colour
            </AccordionTrigger>
            <AccordionContent>
              <ul className="grid grid-cols-2 gap-2">
                {facets.colors.map((color) => (
                  <li key={color.name}>
                    <label className="flex cursor-pointer items-center gap-2">
                      <input
                        type="checkbox"
                        name="color"
                        value={color.name}
                        defaultChecked={current.color.includes(color.name)}
                        className="sr-only"
                      />
                      <span
                        className="h-4 w-4 border border-border"
                        style={{ backgroundColor: color.hex ?? "#ffffff" }}
                        aria-hidden
                      />
                      <span className="text-xs">{color.name}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        )}

        <AccordionItem value="price">
          <AccordionTrigger className="text-xs font-bold uppercase tracking-widest">
            Price
          </AccordionTrigger>
          <AccordionContent>
            <div className="flex items-center gap-2">
              <input
                type="number"
                name="minPrice"
                inputMode="numeric"
                min={0}
                placeholder={`৳${facets.priceRange.min}`}
                defaultValue={current.minPrice}
                aria-label="Minimum price"
                className="h-9 w-full border border-input px-2 text-sm"
              />
              <span aria-hidden>–</span>
              <input
                type="number"
                name="maxPrice"
                inputMode="numeric"
                min={0}
                placeholder={`৳${facets.priceRange.max}`}
                defaultValue={current.maxPrice}
                aria-label="Maximum price"
                className="h-9 w-full border border-input px-2 text-sm"
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        {facets.brands.length > 0 && (
          <AccordionItem value="brand">
            <AccordionTrigger className="text-xs font-bold uppercase tracking-widest">
              Brand
            </AccordionTrigger>
            <AccordionContent>
              <ul className="space-y-2">
                {facets.brands.map((brand) => (
                  <li key={brand}>
                    <label className="flex cursor-pointer items-center gap-2">
                      <input
                        type="checkbox"
                        name="brand"
                        value={brand}
                        defaultChecked={current.brand.includes(brand)}
                        className="h-4 w-4 accent-black"
                      />
                      <span>{brand}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        )}

        {showOnSale && (
          <AccordionItem value="sale" className="border-b-0">
            <AccordionTrigger className="text-xs font-bold uppercase tracking-widest">
              Offers
            </AccordionTrigger>
            <AccordionContent>
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  name="onSale"
                  value="1"
                  defaultChecked={current.onSale}
                  className="h-4 w-4 accent-black"
                />
                <span>On sale only</span>
              </label>
            </AccordionContent>
          </AccordionItem>
        )}
      </Accordion>

      <div className="mt-5 flex items-center gap-3">
        <Button type="submit" className="flex-1">
          Apply filters
        </Button>
        <Link
          href={action}
          className="text-xs font-bold uppercase tracking-widest underline underline-offset-4 hover:decoration-2"
        >
          Clear all
        </Link>
      </div>
    </form>
  );
}
