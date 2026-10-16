import type { Metadata } from "next";

export const SITE_NAME = "Trio Sports BD";

export const SITE_DESCRIPTION =
  "Authentic sports jerseys, trousers and accessories for every sport, delivered across Bangladesh. Cash on delivery with a small advance payment.";

/** Public base URL, without a trailing slash. Falls back to localhost. */
export function siteUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_APP_URL ?? process.env.BETTER_AUTH_URL ?? "";
  const trimmed = raw.trim().replace(/\/+$/, "");
  return trimmed.length > 0 ? trimmed : "http://localhost:3000";
}

export function absoluteUrl(path: string): string {
  return `${siteUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * Shared page metadata: canonical URL plus OpenGraph and Twitter cards.
 * `metadataBase` on the root layout turns these into absolute URLs.
 */
export function buildMetadata({
  title,
  description,
  path = "/",
  image,
}: {
  title: string;
  description?: string;
  path?: string;
  image?: string | null;
}): Metadata {
  const resolvedDescription = description ?? SITE_DESCRIPTION;
  const url = absoluteUrl(path);
  const images = image ? [{ url: image, alt: title }] : undefined;

  return {
    title,
    description: resolvedDescription,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: "en_US",
      url,
      title: `${title} | ${SITE_NAME}`,
      description: resolvedDescription,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${SITE_NAME}`,
      description: resolvedDescription,
      images: image ? [image] : undefined,
    },
  };
}
