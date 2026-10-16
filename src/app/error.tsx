"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function GlobalError({
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
    <div className="mx-auto flex max-w-xl flex-col items-center justify-center gap-4 px-4 py-24 text-center">
      <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
        Something went wrong
      </p>
      <h1 className="text-3xl font-bold uppercase leading-none md:text-5xl">
        We hit a problem
      </h1>
      <p className="text-sm text-muted-foreground">
        The page could not be loaded. Please try again — if it keeps happening,
        message us on WhatsApp.
      </p>
      <Button onClick={reset} className="mt-2">
        Try again
      </Button>
    </div>
  );
}
