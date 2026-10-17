"use server";

import { revalidatePath, revalidateTag } from "next/cache";

import prisma from "@/lib/prisma";
import { BANNERS_TAG } from "@/lib/cache-tags";
import { requireAdminUser } from "@/lib/session";
import { bannerSchema, type BannerValues } from "@/lib/validators/banner";

export type AdminActionResult = { ok: boolean; error?: string; id?: number };

export async function saveBanner(
  values: BannerValues,
  id?: number,
): Promise<AdminActionResult> {
  await requireAdminUser();

  const parsed = bannerSchema.safeParse(values);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.errors[0]?.message ?? "Invalid banner" };
  }
  const data = parsed.data;

  const payload = {
    title: data.title,
    subtitle: data.subtitle?.trim() ? data.subtitle.trim() : null,
    imageUrl: data.imageUrl,
    linkUrl: data.linkUrl,
    sortOrder: data.sortOrder,
    isActive: data.isActive,
  };

  try {
    if (id) {
      await prisma.banner.update({ where: { id }, data: payload });
    } else {
      await prisma.banner.create({ data: payload });
    }
    revalidatePath("/admin/banners");
    revalidatePath("/");
    revalidateTag(BANNERS_TAG);
    return { ok: true };
  } catch (error) {
    console.error("saveBanner failed:", error);
    return { ok: false, error: "Could not save the banner." };
  }
}

export async function deleteBanner(id: number): Promise<AdminActionResult> {
  await requireAdminUser();
  try {
    await prisma.banner.delete({ where: { id } });
    revalidateTag(BANNERS_TAG);
    revalidatePath("/admin/banners");
    revalidatePath("/");
    return { ok: true };
  } catch (error) {
    console.error("deleteBanner failed:", error);
    return { ok: false, error: "Could not delete the banner." };
  }
}
