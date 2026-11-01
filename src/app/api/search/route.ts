import { NextRequest, NextResponse } from "next/server";

import { effectivePrice } from "@/lib/format";
import { searchProductCards } from "@/lib/queries/products";

export const dynamic = "force-dynamic";

const publicCacheHeaders = {
  "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
};

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q") ?? "";

  try {
    const items = await searchProductCards(query, 6);
    return NextResponse.json(
      {
        items: items.map((item) => ({
          id: item.id,
          name: item.name,
          slug: item.slug,
          image: item.image,
          price: effectivePrice(item.basePrice, item.salePrice),
          categoryName: item.categoryName,
        })),
      },
      { headers: publicCacheHeaders },
    );
  } catch {
    return NextResponse.json(
      { items: [] },
      { status: 200, headers: { "Cache-Control": "private, no-store" } },
    );
  }
}
