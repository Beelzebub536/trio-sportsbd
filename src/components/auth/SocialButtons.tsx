"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

type Providers = { google: boolean; facebook: boolean };
type ProviderId = "google" | "facebook";

function GoogleIcon() {
  return (
    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.6v3h3.9c2.3-2.1 3.5-5.2 3.5-8.8z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.9-3c-1.1.7-2.4 1.1-4 1.1-3.1 0-5.7-2.1-6.6-4.9H1.4v3.1C3.4 21.3 7.4 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.4 14.3c-.2-.7-.4-1.5-.4-2.3s.1-1.6.4-2.3V6.6H1.4C.5 8.2 0 10 0 12s.5 3.8 1.4 5.4l4-3.1z"
      />
      <path
        fill="#EA4335"
        d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4C17.9 1.2 15.2 0 12 0 7.4 0 3.4 2.7 1.4 6.6l4 3.1C6.3 6.9 8.9 4.8 12 4.8z"
      />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#1877F2"
        d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07c0 6.02 4.39 11.02 10.13 11.93v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.89v2.25h3.33l-.53 3.49h-2.8V24C19.61 23.09 24 18.09 24 12.07z"
      />
    </svg>
  );
}

export default function SocialButtons({
  providers,
  next,
}: {
  providers: Providers;
  next: string;
}) {
  const [loading, setLoading] = useState<ProviderId | null>(null);

  if (!providers.google && !providers.facebook) {
    return null;
  }

  const signInWith = async (provider: ProviderId) => {
    setLoading(provider);
    const { error } = await authClient.signIn.social({
      provider,
      callbackURL: next,
    });
    if (error) {
      toast.error(error.message ?? `Could not continue with ${provider}.`);
      setLoading(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-3">
        {providers.google && (
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => signInWith("google")}
            disabled={loading !== null}
          >
            <GoogleIcon />
            Continue with Google
          </Button>
        )}
        {providers.facebook && (
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => signInWith("facebook")}
            disabled={loading !== null}
          >
            <FacebookIcon />
            Continue with Facebook
          </Button>
        )}
      </div>
      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-border" />
        <span className="text-xs uppercase tracking-widest text-muted-foreground">
          or
        </span>
        <span className="h-px flex-1 bg-border" />
      </div>
    </div>
  );
}
