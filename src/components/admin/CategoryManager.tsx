"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  deleteCategory,
  saveCategory,
} from "@/actions/admin/categories";
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

export type CategoryRecord = {
  id: number;
  name: string;
  slug: string;
  parentId: number | null;
  image: string | null;
  sortOrder: number;
  productCount: number;
};

const EMPTY = {
  name: "",
  slug: "",
  parentId: "none",
  image: "",
  sortOrder: "0",
};

const slugify = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export default function CategoryManager({
  categories,
}: {
  categories: CategoryRecord[];
}) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const parents = categories.filter((category) => category.id !== editingId);

  const openForm = (category?: CategoryRecord) => {
    setEditingId(category?.id ?? null);
    setForm(
      category
        ? {
            name: category.name,
            slug: category.slug,
            parentId: category.parentId ? String(category.parentId) : "none",
            image: category.image ?? "",
            sortOrder: String(category.sortOrder),
          }
        : EMPTY,
    );
    setOpen(true);
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    const result = await saveCategory(
      {
        name: form.name.trim(),
        slug: form.slug.trim(),
        parentId: form.parentId === "none" ? null : Number(form.parentId),
        image: form.image.trim() ? form.image.trim() : null,
        sortOrder: Math.max(0, Number(form.sortOrder) || 0),
      },
      editingId ?? undefined,
    );
    setBusy(false);

    if (!result.ok) {
      toast.error(result.error ?? "Could not save the category.");
      return;
    }
    toast.success(editingId ? "Category updated" : "Category added");
    setOpen(false);
    setEditingId(null);
    setForm(EMPTY);
    router.refresh();
  };

  const remove = async (category: CategoryRecord) => {
    if (!window.confirm(`Delete “${category.name}”?`)) return;
    setBusy(true);
    const result = await deleteCategory(category.id);
    setBusy(false);
    if (!result.ok) {
      toast.error(result.error ?? "Could not delete the category.");
      return;
    }
    toast.success("Category deleted");
    router.refresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold uppercase leading-none md:text-3xl">
          Categories
        </h1>
        <Button onClick={() => openForm()}>New category</Button>
      </div>

      <ul className="divide-y divide-border border-y border-border">
        {categories.map((category) => (
          <li key={category.id} className="flex flex-wrap items-center gap-3 py-3">
            <div className="min-w-0 flex-1">
              <p className="font-semibold uppercase">
                {category.parentId ? "— " : ""}
                {category.name}
              </p>
              <p className="text-xs text-muted-foreground">
                /{category.slug} · {category.productCount} product
                {category.productCount === 1 ? "" : "s"} · order{" "}
                {category.sortOrder}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => openForm(category)}>
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={busy}
              onClick={() => remove(category)}
            >
              Delete
            </Button>
          </li>
        ))}
      </ul>

      {open && (
        <form
          onSubmit={submit}
          className="space-y-4 border border-border p-4"
          noValidate
        >
          <h2 className="text-sm font-bold uppercase tracking-widest">
            {editingId ? "Edit category" : "New category"}
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="c-name">Name</Label>
              <Input
                id="c-name"
                value={form.name}
                onChange={(event) =>
                  setForm((current) => ({ ...current, name: event.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="c-slug">Slug</Label>
              <div className="flex gap-2">
                <Input
                  id="c-slug"
                  value={form.slug}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, slug: event.target.value }))
                  }
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    setForm((current) => ({ ...current, slug: slugify(current.name) }))
                  }
                >
                  From name
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="c-parent">Parent</Label>
              <Select
                value={form.parentId}
                onValueChange={(value) =>
                  setForm((current) => ({ ...current, parentId: value }))
                }
              >
                <SelectTrigger id="c-parent">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Top level</SelectItem>
                  {parents.map((parent) => (
                    <SelectItem key={parent.id} value={String(parent.id)}>
                      {parent.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="c-sort">Sort order</Label>
              <Input
                id="c-sort"
                type="number"
                min={0}
                value={form.sortOrder}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    sortOrder: event.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="c-image">Image URL (optional)</Label>
              <Input
                id="c-image"
                value={form.image}
                onChange={(event) =>
                  setForm((current) => ({ ...current, image: event.target.value }))
                }
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button type="submit" disabled={busy}>
              {editingId ? "Save changes" : "Add category"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setOpen(false);
                setEditingId(null);
                setForm(EMPTY);
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
