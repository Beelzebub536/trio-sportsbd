"use client";

import Link from "next/link";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function ProductError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex max-w-xl flex-col items-center gap-4 px-4 py-24 text-center">
      <p className="text-sm text-muted-foreground">
        Product unavailable
      </p>
      <h1 className="text-3xl font-bold">We could not load this product</h1>
      <p className="text-sm text-muted-foreground">
        Please try again. Your bag and other products are still available.
      </p>
      <div className="flex gap-3">
        <Button onClick={reset}>Try again</Button>
        <Button asChild variant="outline">
          <Link href="/shop">Back to shop</Link>
        </Button>
      </div>
    </main>
  );
}
