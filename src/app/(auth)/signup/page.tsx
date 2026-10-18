import type { Metadata } from "next";
import Link from "next/link";

import SignupForm from "@/components/auth/SignupForm";
import { getSocialProviders, safeNext } from "@/lib/auth-helpers";

export const metadata: Metadata = {
  title: "Create account",
};

export default async function SignupPage({
  searchParams,
}: {
  searchParams: { next?: string | string[] };
}) {
  const params = await searchParams;
  const next = safeNext(params?.next);
  const providers = getSocialProviders();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold uppercase tracking-tight md:text-4xl">
          Create account
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {next.startsWith("/checkout")
            ? "Create an account to place and track your order. Your bag will be here when you return."
            : "Join Trio Sports BD to place and track orders, save addresses and build a wishlist."}
        </p>
      </div>

      <SignupForm next={next} providers={providers} />

      <p className="text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href={`/login?next=${encodeURIComponent(next)}`}
          className="font-medium text-foreground underline underline-offset-4 hover:no-underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
