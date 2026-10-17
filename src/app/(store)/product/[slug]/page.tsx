import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import ProductRow from "@/components/home/ProductRow";
import ProductDetail from "@/components/product/ProductDetail";
import { effectivePrice } from "@/lib/format";
import { getProductBySlug, getRelatedProducts } from "@/lib/queries/products";
import { getWishlistProductIds } from "@/lib/queries/wishlist";
import { getSession } from "@/lib/session";
import { buildMetadata } from "@/lib/seo";
import { getSettings } from "@/lib/settings";

type PageParams = { slug: string };

export async function generateMetadata({
  params,
}: {
  params: PageParams;
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

export default async function ProductPage({ params }: { params: PageParams }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  const [settings, session] = await Promise.all([getSettings(), getSession()]);
  const isAuthed = Boolean(session?.user);
  const savedIds =
    isAuthed && session?.user ? await getWishlistProductIds(session.user.id) : [];
  const related = await getRelatedProducts(product.id, product.categoryId, 4);

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
        className="mb-6 flex flex-wrap items-center gap-1 text-xs uppercase tracking-widest text-muted-foreground"
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

      {related.length > 0 && (
        <div className="mt-12 border-t border-border pt-4">
          <ProductRow
            title="You may also like"
            href={`/shop?category=${encodeURIComponent(product.category.slug)}`}
            products={related}
          />
        </div>
      )}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </div>
  );
}
