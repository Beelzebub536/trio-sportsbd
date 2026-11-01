/**
 * Server-only helpers for the auth pages.
 */

/** Which social providers have credentials configured (server env). */
export function getSocialProviders(): { google: boolean; facebook: boolean } {
  return {
    google: Boolean(
      process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET,
    ),
    facebook: Boolean(
      process.env.FACEBOOK_CLIENT_ID && process.env.FACEBOOK_CLIENT_SECRET,
    ),
  };
}

/**
 * Only allow same-site relative paths as a redirect target (no open redirect). Resolving against a
 * dummy origin mirrors how browsers read it, so `/\evil.com`, `/\t/evil.com` etc. are rejected.
 */
export function safeNext(value: unknown): string {
  if (typeof value !== "string" || !value.startsWith("/")) return "/";
  try {
    const url = new URL(value, "https://same.invalid");
    return url.origin === "https://same.invalid" ? url.pathname + url.search + url.hash : "/";
  } catch {
    return "/";
  }
}
