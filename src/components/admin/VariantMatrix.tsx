"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import type { ColorOption } from "@/components/admin/ProductImages";

export default function VariantMatrix({
  sizes,
  colors,
  stock,
  onSizesChange,
  onColorsChange,
  onStockChange,
}: {
  sizes: string[];
  colors: ColorOption[];
  stock: Record<string, number>;
  onSizesChange: (sizes: string[]) => void;
  onColorsChange: (colors: ColorOption[]) => void;
  onStockChange: (key: string, value: number) => void;
}) {
  const [sizeInput, setSizeInput] = useState("");
  const [colorName, setColorName] = useState("");
  const [colorHex, setColorHex] = useState("#000000");

  const addSize = () => {
    const value = sizeInput.trim().toUpperCase();
    if (!value || sizes.includes(value)) {
      setSizeInput("");
      return;
    }
    onSizesChange([...sizes, value]);
    setSizeInput("");
  };

  const addColor = () => {
    const name = colorName.trim();
    if (!name || colors.some((color) => color.name === name)) {
      setColorName("");
      return;
    }
    onColorsChange([...colors, { name, hex: colorHex }]);
    setColorName("");
    setColorHex("#000000");
  };

  return (
    <section className="space-y-5 border border-border p-4">
      <h2 className="text-sm font-bold uppercase tracking-widest">
        Sizes, colours &amp; stock
      </h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="size-input">Add a size</Label>
          <div className="flex gap-2">
            <Input
              id="size-input"
              value={sizeInput}
              onChange={(event) => setSizeInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  addSize();
                }
              }}
              placeholder="M"
            />
            <Button type="button" variant="outline" onClick={addSize}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <ul className="flex flex-wrap gap-2">
            {sizes.map((size) => (
              <li
                key={size}
                className="inline-flex items-center gap-1 bg-secondary px-2 py-1 text-xs font-bold"
              >
                {size}
                <button
                  type="button"
                  aria-label={`Remove size ${size}`}
                  onClick={() => onSizesChange(sizes.filter((s) => s !== size))}
                >
                  <X className="h-3 w-3" />
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-2">
          <Label htmlFor="color-name">Add a colour</Label>
          <div className="flex gap-2">
            <Input
              id="color-name"
              value={colorName}
              onChange={(event) => setColorName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  addColor();
                }
              }}
              placeholder="Black"
            />
            <input
              type="color"
              aria-label="Colour swatch"
              value={colorHex}
              onChange={(event) => setColorHex(event.target.value)}
              className="h-10 w-12 border border-input"
            />
            <Button type="button" variant="outline" onClick={addColor}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <ul className="flex flex-wrap gap-2">
            {colors.map((color) => (
              <li
                key={color.name}
                className="inline-flex items-center gap-2 bg-secondary px-2 py-1 text-xs font-bold"
              >
                <span
                  className="h-3 w-3 border border-border"
                  style={{ backgroundColor: color.hex }}
                />
                {color.name}
                <button
                  type="button"
                  aria-label={`Remove colour ${color.name}`}
                  onClick={() =>
                    onColorsChange(colors.filter((c) => c.name !== color.name))
                  }
                >
                  <X className="h-3 w-3" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {sizes.length > 0 && colors.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                <th className="border border-border bg-secondary px-3 py-2 text-left text-xs uppercase tracking-widest">
                  Size \ Colour
                </th>
                {colors.map((color) => (
                  <th
                    key={color.name}
                    className="border border-border bg-secondary px-3 py-2 text-xs uppercase tracking-widest"
                  >
                    {color.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sizes.map((size) => (
                <tr key={size}>
                  <th className="border border-border px-3 py-2 text-left text-xs uppercase tracking-widest">
                    {size}
                  </th>
                  {colors.map((color) => {
                    const key = `${size}__${color.name}`;
                    return (
                      <td key={key} className="border border-border p-1">
                        <input
                          type="number"
                          min={0}
                          aria-label={`Stock for ${size} ${color.name}`}
                          value={stock[key] ?? 0}
                          onChange={(event) =>
                            onStockChange(
                              key,
                              Math.max(0, Number(event.target.value) || 0),
                            )
                          }
                          className="h-9 w-20 border border-input px-2 text-sm"
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          Add at least one size and one colour to build the stock matrix.
        </p>
      )}
    </section>
  );
}
