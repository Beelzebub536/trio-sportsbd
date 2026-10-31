"use server";

import { revalidatePath } from "next/cache";

import prisma from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import { addressSchema, type AddressValues } from "@/lib/validators/address";

export type ActionResult = { ok: boolean; error?: string };

export async function saveAddress(
  values: AddressValues,
  id?: number,
): Promise<ActionResult> {
  const userId = await requireUserId();
  const parsed = addressSchema.safeParse(values);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid address" };
  }
  const data = parsed.data;

  if (id) {
    const existing = await prisma.address.findFirst({ where: { id, userId } });
    if (!existing) return { ok: false, error: "Address not found" };
  }

  await prisma.$transaction(async (tx) => {
    if (data.isDefault) {
      await tx.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }
    if (id) {
      await tx.address.update({ where: { id }, data });
    } else {
      const count = await tx.address.count({ where: { userId } });
      await tx.address.create({
        data: { ...data, userId, isDefault: data.isDefault || count === 0 },
      });
    }
  });

  revalidatePath("/account/addresses");
  revalidatePath("/checkout");
  return { ok: true };
}

export async function deleteAddress(id: number): Promise<ActionResult> {
  const userId = await requireUserId();
  const existing = await prisma.address.findFirst({ where: { id, userId } });
  if (!existing) return { ok: false, error: "Address not found" };

  await prisma.address.delete({ where: { id } });
  revalidatePath("/account/addresses");
  revalidatePath("/checkout");
  return { ok: true };
}

export async function setDefaultAddress(id: number): Promise<ActionResult> {
  const userId = await requireUserId();
  const existing = await prisma.address.findFirst({ where: { id, userId } });
  if (!existing) return { ok: false, error: "Address not found" };

  await prisma.$transaction([
    prisma.address.updateMany({ where: { userId }, data: { isDefault: false } }),
    prisma.address.update({ where: { id }, data: { isDefault: true } }),
  ]);

  revalidatePath("/account/addresses");
  revalidatePath("/checkout");
  return { ok: true };
}
