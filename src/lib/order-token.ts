import { createHmac, timingSafeEqual } from "crypto";

/**
 * Short-lived signed tokens so an order success page can be viewed by the
 * person who placed it (guest or logged-in) without guessing order numbers.
 */
// Read lazily: builds run without secrets, but a production server must never fall back to a
// value that is public in this repo (that would let anyone forge order links).
function secret(): string {
  const value = process.env.BETTER_AUTH_SECRET;
  if (value) return value;
  if (process.env.NODE_ENV === "production") throw new Error("BETTER_AUTH_SECRET is not set");
  return "trio-dev-secret";
}

const DEFAULT_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

const sign = (payload: string): string =>
  createHmac("sha256", secret()).update(payload).digest("base64url");

export function signOrderToken(
  orderNumber: string,
  ttlMs: number = DEFAULT_TTL_MS,
): string {
  const expires = Date.now() + ttlMs;
  return `${expires}.${sign(`${orderNumber}.${expires}`)}`;
}

export function verifyOrderToken(orderNumber: string, token: string): boolean {
  const [expiresRaw, signature] = token.split(".");
  const expires = Number(expiresRaw);

  if (!Number.isFinite(expires) || Date.now() > expires || !signature) {
    return false;
  }

  const expected = sign(`${orderNumber}.${expires}`);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);

  return a.length === b.length && timingSafeEqual(a, b);
}
