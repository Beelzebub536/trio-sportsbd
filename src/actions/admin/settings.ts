"use server";

import { revalidatePath, revalidateTag } from "next/cache";

import prisma from "@/lib/prisma";
import { requireAdminUser } from "@/lib/session";
import { SETTINGS_TAG } from "@/lib/settings";
import { settingsSchema, type SettingsValues } from "@/lib/validators/settings";

export type AdminActionResult = { ok: boolean; error?: string };

export async function saveSettings(
  values: SettingsValues,
): Promise<AdminActionResult> {
  await requireAdminUser();

  const parsed = settingsSchema.safeParse(values);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid settings",
    };
  }

  const entries = Object.entries(parsed.data);

  try {
    await prisma.$transaction(
      entries.map(([key, value]) =>
        prisma.setting.upsert({
          where: { key },
          create: { key, value },
          update: { value },
        }),
      ),
    );

    revalidateTag(SETTINGS_TAG, { expire: 0 });
    revalidatePath("/admin/settings");
    revalidatePath("/");
    return { ok: true };
  } catch (error) {
    console.error("saveSettings failed:", error);
    return { ok: false, error: "Could not save the settings." };
  }
}
