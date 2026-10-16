"use client";

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

export type PriceFiltersState = {
  q: string;
  category: string;
  gender: string;
  brand: string;
  onSale: boolean;
  activeOnly: boolean;
};

export const EMPTY_FILTERS: PriceFiltersState = {
  q: "",
  category: "all",
  gender: "all",
  brand: "all",
  onSale: false,
  activeOnly: false,
};

export default function PriceFilters({
  filters,
  categories,
  brands,
  onChange,
}: {
  filters: PriceFiltersState;
  categories: string[];
  brands: string[];
  onChange: (filters: PriceFiltersState) => void;
}) {
  const set = <K extends keyof PriceFiltersState>(
    key: K,
    value: PriceFiltersState[K],
  ) => onChange({ ...filters, [key]: value });

  return (
    <div className="grid gap-4 border border-border p-4 sm:grid-cols-2 lg:grid-cols-3">
      <div className="space-y-2">
        <Label htmlFor="pf-q">Search</Label>
        <Input
          id="pf-q"
          value={filters.q}
          onChange={(event) => set("q", event.target.value)}
          placeholder="Name, slug or brand"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="pf-category">Category</Label>
        <Select
          value={filters.category}
          onValueChange={(value) => set("category", value)}
        >
          <SelectTrigger id="pf-category">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="pf-gender">Gender</Label>
        <Select
          value={filters.gender}
          onValueChange={(value) => set("gender", value)}
        >
          <SelectTrigger id="pf-gender">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {["MEN", "WOMEN", "KIDS", "UNISEX"].map((gender) => (
              <SelectItem key={gender} value={gender}>
                {gender}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="pf-brand">Brand</Label>
        <Select value={filters.brand} onValueChange={(value) => set("brand", value)}>
          <SelectTrigger id="pf-brand">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All brands</SelectItem>
            {brands.map((brand) => (
              <SelectItem key={brand} value={brand}>
                {brand}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-end gap-6 lg:col-span-2">
        <label className="flex items-center gap-2 text-sm">
          <Switch
            checked={filters.onSale}
            onCheckedChange={(value) => set("onSale", value)}
          />
          On sale only
        </label>
        <label className="flex items-center gap-2 text-sm">
          <Switch
            checked={filters.activeOnly}
            onCheckedChange={(value) => set("activeOnly", value)}
          />
          Active only
        </label>
      </div>
    </div>
  );
}
