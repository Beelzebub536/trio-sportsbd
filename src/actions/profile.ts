"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { requireUserId } from "@/lib/session";

export type ActionResult = { ok: boolean; error?: string };

const profileSchema = z.object({
  name: z.string().trim().min(2, "Enter your name"),
});

export async function updateProfile(values: {
  name: string;
}): Promise<ActionResult> {
  await requireUserId();
  const parsed = profileSchema.safeParse(values);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message };
  }

  try {
    await auth.api.updateUser({
      body: { name: parsed.data.name },
      headers: await headers(),
    });
    revalidatePath("/account");
    revalidatePath("/account/profile");
    return { ok: true };
  } catch {
    return { ok: false, error: "Could not update your profile." };
  }
}

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password"),
    newPassword: z.string().min(8, "New password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Confirm your new password"),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export async function changePassword(values: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}): Promise<ActionResult> {
  await requireUserId();
  const parsed = passwordSchema.safeParse(values);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message };
  }

  try {
    await auth.api.changePassword({
      body: {
        currentPassword: parsed.data.currentPassword,
        newPassword: parsed.data.newPassword,
        revokeOtherSessions: false,
      },
      headers: await headers(),
    });
    return { ok: true };
  } catch {
    return { ok: false, error: "Could not change your password. Check your current password." };
  }
}
