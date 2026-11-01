import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import HomeSectionSkeleton from "@/components/home/HomeSectionSkeleton";
import ProductDetail from "@/components/product/ProductDetail";
import RelatedProductsSection from "@/components/product/RelatedProductsSection";
import { effectivePrice } from "@/lib/format";
import { getProductBySlug } from "@/lib/queries/products";
import { getWishlistProductIds } from "@/lib/queries/wishlist";
import { getSession } from "@/lib/session";
import { buildMetadata } from "@/lib/seo";
import { getSettings } from "@/lib/settings";

type PageParams = { slug: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  return buildMetadata({
    title: product.name,
    description: product.description.slice(0, 155),
    path: `/product/${product.slug}`,
    image: product.images[0]?.url ?? null,
  });
}

export default async function ProductPage({ params }: { params: Promise<PageParams> }) {
  const { slug } = await params;
  const settingsPromise = getSettings();
  const sessionPromise = getSession();
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  const [settings, session] = await Promise.all([
    settingsPromise,
    sessionPromise,
  ]);
  const isAuthed = Boolean(session?.user);
  const savedIds =
    isAuthed && session?.user
      ? await getWishlistProductIds(session.user.id)
      : [];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images.map((image) => image.url),
    brand: { "@type": "Brand", name: product.brand ?? "Trio" },
    offers: {
      "@type": "Offer",
      priceCurrency: "BDT",
      price: effectivePrice(product.basePrice, product.salePrice),
      availability: product.variants.some((variant) => variant.stock > 0)
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <nav
        aria-label="Breadcrumb"
        className="mb-6 flex flex-wrap items-center gap-1 text-sm text-muted-foreground"
      >
        <Link href="/" className="hover:underline">
          Home
        </Link>
        <span aria-hidden>/</span>
        <Link href="/shop" className="hover:underline">
          Shop
        </Link>
        <span aria-hidden>/</span>
        <Link
          href={`/shop?category=${encodeURIComponent(product.category.slug)}`}
          className="hover:underline"
        >
          {product.category.name}
        </Link>
      </nav>

      <ProductDetail
        product={{
          id: product.id,
          name: product.name,
          slug: product.slug,
          description: product.description,
          brand: product.brand,
          categoryName: product.category.name,
          basePrice: product.basePrice,
          salePrice: product.salePrice,
        }}
        variants={product.variants}
        images={product.images}
        isAuthed={isAuthed}
        saved={savedIds.includes(product.id)}
        whatsappNumber={settings.whatsappNumber}
      />

      <Suspense fallback={<HomeSectionSkeleton kind="row" />}>
        <RelatedProductsSection
          productId={product.id}
          categoryId={product.categoryId}
          categorySlug={product.category.slug}
        />
      </Suspense>

      <script
        type="application/ld+json"
        // Escape "<" so admin-entered text like "</script>" cannot break out of the tag.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
    </div>
  );
}
