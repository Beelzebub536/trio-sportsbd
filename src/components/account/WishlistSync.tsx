"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import { mergeWishlistAction } from "@/actions/wishlist";
import { useWishlistStore } from "@/stores/wishlist";

/**
 * Merges a guest's localStorage wishlist into the database once a user is
 * signed in, then clears the local copy.
 */
export default function WishlistSync() {
  const ids = useWishlistStore((state) => state.ids);
  const clear = useWishlistStore((state) => state.clear);
  const router = useRouter();
  const done = useRef(false);

  useEffect(() => {
    if (done.current || ids.length === 0) return;
    done.current = true;

    mergeWishlistAction(ids)
      .then(() => {
        clear();
        router.refresh();
      })
      .catch(() => undefined);
  }, [ids, clear, router]);

  return null;
}
