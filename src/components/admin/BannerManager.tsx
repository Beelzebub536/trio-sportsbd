"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { deleteBanner, saveBanner } from "@/actions/admin/banners";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export type BannerRecord = {
  id: number;
  title: string;
  subtitle: string | null;
  imageUrl: string;
  linkUrl: string;
  sortOrder: number;
  isActive: boolean;
};

const EMPTY = {
  title: "",
  subtitle: "",
  imageUrl: "",
  linkUrl: "/shop",
  sortOrder: "0",
  isActive: true,
};

export default function BannerManager({ banners }: { banners: BannerRecord[] }) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const openForm = (banner?: BannerRecord) => {
    setEditingId(banner?.id ?? null);
    setForm(
      banner
        ? {
            title: banner.title,
            subtitle: banner.subtitle ?? "",
            imageUrl: banner.imageUrl,
            linkUrl: banner.linkUrl,
            sortOrder: String(banner.sortOrder),
            isActive: banner.isActive,
          }
        : EMPTY,
    );
    setOpen(true);
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    const result = await saveBanner(
      {
        title: form.title.trim(),
        subtitle: form.subtitle.trim() ? form.subtitle.trim() : null,
        imageUrl: form.imageUrl.trim(),
        linkUrl: form.linkUrl.trim(),
        sortOrder: Math.max(0, Number(form.sortOrder) || 0),
        isActive: form.isActive,
      },
      editingId ?? undefined,
    );
    setBusy(false);

    if (!result.ok) {
      toast.error(result.error ?? "Could not save the banner.");
      return;
    }
    toast.success(editingId ? "Banner updated" : "Banner added");
    setOpen(false);
    setEditingId(null);
    setForm(EMPTY);
    router.refresh();
  };

  const remove = async (banner: BannerRecord) => {
    if (!window.confirm(`Delete “${banner.title}”?`)) return;
    setBusy(true);
    const result = await deleteBanner(banner.id);
    setBusy(false);
    if (!result.ok) {
      toast.error(result.error ?? "Could not delete the banner.");
      return;
    }
    toast.success("Banner deleted");
    router.refresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold uppercase leading-none md:text-3xl">
          Home banners
        </h1>
        <Button onClick={() => openForm()}>New banner</Button>
      </div>

      <ul className="divide-y divide-border border-y border-border">
        {banners.map((banner) => (
          <li key={banner.id} className="flex flex-wrap items-center gap-3 py-3">
            <div className="min-w-0 flex-1">
              <p className="font-semibold uppercase">{banner.title}</p>
              <p className="text-xs text-muted-foreground">
                → {banner.linkUrl} · order {banner.sortOrder} ·{" "}
                {banner.isActive ? "active" : "hidden"}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => openForm(banner)}>
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={busy}
              onClick={() => remove(banner)}
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
            {editingId ? "Edit banner" : "New banner"}
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="b-title">Title</Label>
              <Input
                id="b-title"
                value={form.title}
                onChange={(event) =>
                  setForm((current) => ({ ...current, title: event.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="b-subtitle">Subtitle</Label>
              <Input
                id="b-subtitle"
                value={form.subtitle}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    subtitle: event.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="b-image">Image URL</Label>
              <Input
                id="b-image"
                value={form.imageUrl}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    imageUrl: event.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="b-link">Link</Label>
              <Input
                id="b-link"
                value={form.linkUrl}
                onChange={(event) =>
                  setForm((current) => ({ ...current, linkUrl: event.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="b-sort">Sort order</Label>
              <Input
                id="b-sort"
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
            <div className="flex items-center gap-2 pt-6">
              <Switch
                checked={form.isActive}
                onCheckedChange={(value) =>
                  setForm((current) => ({ ...current, isActive: value }))
                }
              />
              <span className="text-sm">Active</span>
            </div>
          </div>

          <div className="flex gap-3">
            <Button type="submit" disabled={busy}>
              {editingId ? "Save changes" : "Add banner"}
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
