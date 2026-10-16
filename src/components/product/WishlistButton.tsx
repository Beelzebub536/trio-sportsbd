"use client";

import { useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { toast } from "sonner";

import { toggleWishlistAction } from "@/actions/wishlist";
import { useWishlistStore } from "@/stores/wishlist";
import { cn } from "@/lib/utils";

export default function WishlistButton({
  productId,
  saved = false,
  isAuthed = false,
  className,
}: {
  productId: number;
  saved?: boolean;
  isAuthed?: boolean;
  className?: string;
}) {
  const localIds = useWishlistStore((state) => state.ids);
  const toggleLocal = useWishlistStore((state) => state.toggle);
  const [serverSaved, setServerSaved] = useState(saved);
  const [pending, startTransition] = useTransition();

  const isSaved = isAuthed ? serverSaved : localIds.includes(productId);

  const handleClick = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    if (isAuthed) {
      startTransition(async () => {
        try {
          const result = await toggleWishlistAction(productId);
          setServerSaved(result.saved);
          toast.success(result.saved ? "Added to wishlist" : "Removed from wishlist");
        } catch {
          toast.error("Could not update your wishlist.");
        }
      });
      return;
    }

    toggleLocal(productId);
  };

  return (
    <button
      type="button"
      aria-label={isSaved ? "Remove from wishlist" : "Add to wishlist"}
      aria-pressed={isSaved}
      onClick={handleClick}
      disabled={pending}
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center bg-white/85 backdrop-blur transition-colors hover:bg-white",
        className,
      )}
    >
      <Heart
        className={cn(
          "h-4 w-4",
          isSaved ? "fill-[var(--brand-sale)] text-[var(--brand-sale)]" : "text-black",
        )}
      />
    </button>
  );
}
