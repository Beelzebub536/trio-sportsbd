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

/** Only allow same-site relative paths as a redirect target (no open redirect). */
export function safeNext(value: unknown): string {
  if (
    typeof value === "string" &&
    value.startsWith("/") &&
    !value.startsWith("//")
  ) {
    return value;
  }
  return "/";
}
