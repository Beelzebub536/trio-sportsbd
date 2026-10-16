"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  deleteProduct,
  toggleProductActive,
} from "@/actions/admin/products";
import { Switch } from "@/components/ui/switch";

export default function ProductRowActions({
  id,
  slug,
  isActive,
  name,
}: {
  id: number;
  slug: string;
  isActive: boolean;
  name: string;
}) {
  const router = useRouter();
  const [active, setActive] = useState(isActive);
  const [busy, setBusy] = useState(false);

  const handleToggle = async (value: boolean) => {
    setActive(value);
    const result = await toggleProductActive(id, value);
    if (!result.ok) {
      setActive(!value);
      toast.error(result.error ?? "Could not update the product.");
      return;
    }
    router.refresh();
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete “${name}”? This cannot be undone.`)) return;
    setBusy(true);
    const result = await deleteProduct(id);
    setBusy(false);
    if (!result.ok) {
      toast.error(result.error ?? "Could not delete the product.");
      return;
    }
    toast.success("Product deleted");
    router.refresh();
  };

  return (
    <div className="flex items-center gap-3">
      <Switch
        checked={active}
        onCheckedChange={handleToggle}
        aria-label={`Toggle ${name} active`}
      />
      <Link
        href={`/admin/products/${id}`}
        aria-label={`Edit ${name}`}
        className="p-1.5 hover:bg-secondary"
      >
        <Pencil className="h-4 w-4" />
      </Link>
      <button
        type="button"
        aria-label={`Delete ${name}`}
        disabled={busy}
        onClick={handleDelete}
        className="p-1.5 text-muted-foreground hover:text-[var(--brand-sale)]"
      >
        <Trash2 className="h-4 w-4" />
      </button>
      <Link href={`/product/${slug}`} className="sr-only">
        View {name}
      </Link>
    </div>
  );
}
