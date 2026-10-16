import crypto from "crypto";

import { NextResponse } from "next/server";

import { requireAdminUser } from "@/lib/session";

export const dynamic = "force-dynamic";

/**
 * Returns a short-lived Cloudinary upload signature so the admin product form
 * can upload images directly to Cloudinary without exposing the API secret.
 */
export async function POST() {
  try {
    await requireAdminUser();
  } catch {
    return NextResponse.json({ error: "Not authorised" }, { status: 403 });
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return NextResponse.json(
      { error: "Cloudinary is not configured. Add image URLs instead." },
      { status: 503 },
    );
  }

  const timestamp = Math.round(Date.now() / 1000);
  const folder = "trio-sportsbd/products";
  const signature = crypto
    .createHash("sha1")
    .update(`folder=${folder}&timestamp=${timestamp}${apiSecret}`)
    .digest("hex");

  return NextResponse.json({ cloudName, apiKey, timestamp, folder, signature });
}
