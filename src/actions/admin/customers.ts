"use server";

import { revalidatePath } from "next/cache";

import prisma from "@/lib/prisma";
import { requireAdminUser } from "@/lib/session";

export type AdminActionResult = { ok: boolean; error?: string };

export async function setUserRole(
  userId: string,
  role: "admin" | "customer",
): Promise<AdminActionResult> {
  const admin = await requireAdminUser();

  if (admin.id === userId && role !== "admin") {
    return { ok: false, error: "You cannot remove your own admin access." };
  }

  await prisma.user.update({ where: { id: userId }, data: { role } });
  revalidatePath("/admin/customers");
  return { ok: true };
}

export async function deleteUser(userId: string): Promise<AdminActionResult> {
  const admin = await requireAdminUser();

  if (admin.id === userId) {
    return { ok: false, error: "You cannot delete your own account here." };
  }

  try {
    await prisma.$transaction([
      prisma.wishlist.deleteMany({ where: { userId } }),
      prisma.address.deleteMany({ where: { userId } }),
      prisma.order.updateMany({ where: { userId }, data: { userId: null } }),
      prisma.session.deleteMany({ where: { userId } }),
      prisma.account.deleteMany({ where: { userId } }),
      prisma.user.delete({ where: { id: userId } }),
    ]);
    revalidatePath("/admin/customers");
    return { ok: true };
  } catch (error) {
    console.error("deleteUser failed:", error);
    return { ok: false, error: "Could not delete this customer." };
  }
}
