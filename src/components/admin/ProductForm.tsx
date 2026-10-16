"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { saveProduct } from "@/actions/admin/products";
import ProductImages, {
  type ColorOption,
  type ImageRow,
} from "@/components/admin/ProductImages";
import VariantMatrix from "@/components/admin/VariantMatrix";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

export type AdminProductData = {
  id: number;
  name: string;
  slug: string;
  description: string;
  brand: string | null;
  gender: string;
  categoryId: number;
  basePrice: number;
  salePrice: number | null;
  isActive: boolean;
  isFeatured: boolean;
  images: ImageRow[];
  variants: Array<{
    size: string;
    color: string;
    colorHex: string | null;
    stock: number;
  }>;
};

const GENDERS = ["MEN", "WOMEN", "KIDS", "UNISEX"];

const slugify = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export default function ProductForm({
  categories,
  product,
}: {
  categories: Array<{ id: number; name: string }>;
  product?: AdminProductData;
}) {
  const router = useRouter();

  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [brand, setBrand] = useState(product?.brand ?? "");
  const [gender, setGender] = useState(product?.gender ?? "MEN");
  const [categoryId, setCategoryId] = useState<string>(
    product ? String(product.categoryId) : String(categories[0]?.id ?? ""),
  );
  const [basePrice, setBasePrice] = useState(
    product ? String(product.basePrice) : "",
  );
  const [salePrice, setSalePrice] = useState(
    product?.salePrice != null ? String(product.salePrice) : "",
  );
  const [isActive, setIsActive] = useState(product?.isActive ?? true);
  const [isFeatured, setIsFeatured] = useState(product?.isFeatured ?? false);

  const [images, setImages] = useState<ImageRow[]>(product?.images ?? []);
  const [sizes, setSizes] = useState<string[]>(() => [
    ...new Set((product?.variants ?? []).map((variant) => variant.size)),
  ]);
  const [colors, setColors] = useState<ColorOption[]>(() => {
    const map = new Map<string, string>();
    (product?.variants ?? []).forEach((variant) => {
      if (!map.has(variant.color)) {
        map.set(variant.color, variant.colorHex ?? "#000000");
      }
    });
    return [...map.entries()].map(([colorName, hex]) => ({ name: colorName, hex }));
  });
  const [stock, setStock] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    (product?.variants ?? []).forEach((variant) => {
      initial[`${variant.size}__${variant.color}`] = variant.stock;
    });
    return initial;
  });
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!name.trim() || !slug.trim()) {
      toast.error("Name and slug are required.");
      return;
    }
    if (!categoryId) {
      toast.error("Choose a category.");
      return;
    }
    if (sizes.length === 0 || colors.length === 0) {
      toast.error("Add at least one size and one colour.");
      return;
    }

    const variants = sizes.flatMap((size) =>
      colors.map((color) => ({
        size,
        color: color.name,
        colorHex: color.hex,
        stock: stock[`${size}__${color.name}`] ?? 0,
        sku: null,
      })),
    );

    setBusy(true);
    const result = await saveProduct(
      {
        name: name.trim(),
        slug: slug.trim(),
        description: description.trim(),
        brand: brand.trim() ? brand.trim() : null,
        gender: gender as "MEN" | "WOMEN" | "KIDS" | "UNISEX",
        categoryId: Number(categoryId),
        basePrice: Math.max(0, Number(basePrice) || 0),
        salePrice: salePrice.trim() ? Math.max(0, Number(salePrice)) : null,
        isActive,
        isFeatured,
        images: images.map((image, index) => ({
          url: image.url,
          publicId: image.publicId,
          color: image.color,
          sortOrder: index,
        })),
        variants,
      },
      product?.id,
    );
    setBusy(false);

    if (!result.ok) {
      toast.error(result.error ?? "Could not save the product.");
      return;
    }

    toast.success("Product saved");
    router.push("/admin/products");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold uppercase leading-none md:text-3xl">
          {product ? "Edit product" : "New product"}
        </h1>
        <Button type="submit" disabled={busy}>
          {busy ? "Saving…" : "Save product"}
        </Button>
      </div>

      <section className="grid gap-4 border border-border p-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="p-name">Name</Label>
          <Input
            id="p-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="p-slug">Slug</Label>
          <div className="flex gap-2">
            <Input
              id="p-slug"
              value={slug}
              onChange={(event) => setSlug(event.target.value)}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => setSlug(slugify(name))}
            >
              From name
            </Button>
          </div>
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="p-description">Description</Label>
          <Textarea
            id="p-description"
            rows={4}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="p-brand">Brand</Label>
          <Input
            id="p-brand"
            value={brand}
            onChange={(event) => setBrand(event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="p-category">Category</Label>
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger id="p-category">
              <SelectValue placeholder="Choose a category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={String(category.id)}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="p-gender">Gender</Label>
          <Select value={gender} onValueChange={setGender}>
            <SelectTrigger id="p-gender">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {GENDERS.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="p-base">Base price (৳)</Label>
            <Input
              id="p-base"
              type="number"
              min={0}
              value={basePrice}
              onChange={(event) => setBasePrice(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="p-sale">Sale price (৳)</Label>
            <Input
              id="p-sale"
              type="number"
              min={0}
              value={salePrice}
              onChange={(event) => setSalePrice(event.target.value)}
              placeholder="Optional"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-6 sm:col-span-2">
          <label className="flex items-center gap-2 text-sm">
            <Switch checked={isActive} onCheckedChange={setIsActive} />
            Active (visible in the shop)
          </label>
          <label className="flex items-center gap-2 text-sm">
            <Switch checked={isFeatured} onCheckedChange={setIsFeatured} />
            Featured on the home page
          </label>
        </div>
      </section>

      <ProductImages images={images} colors={colors} onChange={setImages} />

      <VariantMatrix
        sizes={sizes}
        colors={colors}
        stock={stock}
        onSizesChange={setSizes}
        onColorsChange={setColors}
        onStockChange={(key, value) =>
          setStock((current) => ({ ...current, [key]: value }))
        }
      />

      <div className="flex gap-3">
        <Button type="submit" disabled={busy}>
          {busy ? "Saving…" : "Save product"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/products")}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
