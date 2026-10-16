import crypto from "crypto";

import { NextResponse } from "next/server";

import { requireAdminUser } from "@/lib/session";

export const dynamic = "force-dynamic";

const FOLDER = "trio-sportsbd/products";
const ALLOWED_FORMATS = "jpg,jpeg,png,webp";
const MAX_FILE_SIZE = 5_000_000; // 5 MB

/**
 * Returns a short-lived Cloudinary upload signature so the admin product form
 * can upload images straight to Cloudinary. Admin-only; the API secret never
 * leaves the server. The signature also pins the folder, the allowed formats
 * and the maximum file size.
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

  const params: Record<string, string | number> = {
    allowed_formats: ALLOWED_FORMATS,
    folder: FOLDER,
    max_file_size: MAX_FILE_SIZE,
    timestamp: Math.round(Date.now() / 1000),
  };

  const toSign = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");

  const signature = crypto
    .createHash("sha1")
    .update(`${toSign}${apiSecret}`)
    .digest("hex");

  return NextResponse.json({
    cloudName,
    apiKey,
    uploadUrl: `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    params: { ...params, signature },
  });
}
