import type { Metadata } from "next";
import Link from "next/link";

import LoginForm from "@/components/auth/LoginForm";
import { getSocialProviders, safeNext } from "@/lib/auth-helpers";

export const metadata: Metadata = {
  title: "Sign in",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { next?: string | string[] };
}) {
  const params = await searchParams;
  const next = safeNext(params?.next);
  const providers = getSocialProviders();
  const whatsappNumber = process.env.WHATSAPP_NUMBER ?? "8801700000000";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold uppercase tracking-tight md:text-4xl">
          Sign in
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Welcome back. Sign in to track orders and check out faster.
        </p>
      </div>

      <LoginForm next={next} providers={providers} />

      <p className="text-sm text-muted-foreground">
        Forgot your password?{" "}
        <a
          href={`https://wa.me/${whatsappNumber}`}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-foreground underline underline-offset-4 hover:no-underline"
        >
          Message us on WhatsApp
        </a>
      </p>

      <p className="text-sm text-muted-foreground">
        New to Trio Sports BD?{" "}
        <Link
          href={`/signup?next=${encodeURIComponent(next)}`}
          className="font-medium text-foreground underline underline-offset-4 hover:no-underline"
        >
          Create an account
        </Link>
      </p>
    </div>
  );
}
