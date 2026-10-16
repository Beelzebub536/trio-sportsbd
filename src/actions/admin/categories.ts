"use server";

import { revalidatePath } from "next/cache";

import prisma from "@/lib/prisma";
import { requireAdminUser } from "@/lib/session";
import { categorySchema, type CategoryValues } from "@/lib/validators/category";

export type AdminActionResult = { ok: boolean; error?: string; id?: number };

export async function saveCategory(
  values: CategoryValues,
  id?: number,
): Promise<AdminActionResult> {
  await requireAdminUser();

  const parsed = categorySchema.safeParse(values);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.errors[0]?.message ?? "Invalid category",
    };
  }
  const data = parsed.data;

  if (id && data.parentId === id) {
    return { ok: false, error: "A category cannot be its own parent." };
  }

  const clash = await prisma.category.findFirst({
    where: { slug: data.slug, ...(id ? { id: { not: id } } : {}) },
    select: { id: true },
  });
  if (clash) {
    return { ok: false, error: "That slug is already used by another category." };
  }

  const payload = {
    name: data.name,
    slug: data.slug,
    parentId: data.parentId ?? null,
    image: data.image?.trim() ? data.image.trim() : null,
    sortOrder: data.sortOrder,
  };

  try {
    if (id) {
      await prisma.category.update({ where: { id }, data: payload });
    } else {
      await prisma.category.create({ data: payload });
    }

    revalidatePath("/admin/categories");
    revalidatePath("/");
    return { ok: true };
  } catch (error) {
    console.error("saveCategory failed:", error);
    return { ok: false, error: "Could not save the category." };
  }
}

export async function deleteCategory(id: number): Promise<AdminActionResult> {
  await requireAdminUser();

  const [productCount, childCount] = await Promise.all([
    prisma.product.count({ where: { categoryId: id } }),
    prisma.category.count({ where: { parentId: id } }),
  ]);

  if (productCount > 0) {
    return {
      ok: false,
      error: `This category still has ${productCount} product(s). Move or delete them first.`,
    };
  }
  if (childCount > 0) {
    return {
      ok: false,
      error: "This category has subcategories. Delete or move them first.",
    };
  }

  try {
    await prisma.category.delete({ where: { id } });
    revalidatePath("/admin/categories");
    revalidatePath("/");
    return { ok: true };
  } catch (error) {
    console.error("deleteCategory failed:", error);
    return { ok: false, error: "Could not delete the category." };
  }
}
