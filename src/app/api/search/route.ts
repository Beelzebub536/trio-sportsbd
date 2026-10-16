import { NextRequest, NextResponse } from "next/server";

import { searchProductCards } from "@/lib/queries/products";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q") ?? "";

  try {
    const items = await searchProductCards(query, 6);
    return NextResponse.json({
      items: items.map((item) => ({
        id: item.id,
        name: item.name,
        slug: item.slug,
        image: item.image,
        price: item.salePrice ?? item.basePrice,
        categoryName: item.categoryName,
      })),
    });
  } catch {
    return NextResponse.json({ items: [] }, { status: 200 });
  }
}
