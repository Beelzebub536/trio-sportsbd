import { NextResponse } from "next/server";

import { env } from "@/lib/env";
import { expireStalePendingOrders } from "@/lib/order-expiry";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!env.CRON_SECRET) {
    return NextResponse.json({ error: "Cron is not configured." }, { status: 503 });
  }
  if (request.headers.get("authorization") !== `Bearer ${env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const result = await expireStalePendingOrders();
  return NextResponse.json(result);
}
