import { PrismaClient, Prisma } from "@prisma/client";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin as adminPlugin } from "better-auth/plugins";
import {
  seedBanners,
  seedCategories,
  seedProducts,
  seedSettings,
  type SeedProduct,
} from "./seed-data";

// `npm run db:seed` runs this file with tsx, which (unlike Next.js) does not
// load `.env` automatically. Node 20.12+ ships `process.loadEnvFile`, so we can
// read it without adding a dotenv dependency.
const nodeProcess = process as NodeJS.Process & {
  loadEnvFile?: (path?: string) => void;
};
if (typeof nodeProcess.loadEnvFile === "function") {
  try {
    nodeProcess.loadEnvFile();
  } catch {
    // No .env file present; rely on variables provided by the shell.
  }
}

const prisma = new PrismaClient();

/**
 * A Better Auth instance used ONLY by the seed script to create the admin
 * account. It intentionally omits `nextCookies()` (Next.js-only) so it can run
 * as a plain Node script. Creating users through Better Auth's own API means
 * the password is hashed with the exact algorithm the running app verifies.
 */
const seedAuth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  secret: process.env.BETTER_AUTH_SECRET ?? "seed-only-secret-not-used-at-runtime",
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
  emailAndPassword: { enabled: true, requireEmailVerification: false },
  // Mirrors the runtime config. The admin plugin declares `role` with
  // `input: false`, so a public signup can never set `role` — only this seed
  // (which updates the row directly) or an admin action can. See
  // `src/lib/auth.ts` and `src/actions/customers.ts`.
  plugins: [adminPlugin({ adminRoles: ["admin"], defaultRole: "customer" })],
});

const slugify = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

/** Deterministic stock in the 5..40 range so re-runs produce identical data. */
const stockFor = (productIndex: number, variantIndex: number): number =>
  5 + ((productIndex * 7 + variantIndex * 5) % 36);

const descriptionTemplates: Record<string, string> = {
  "football-jerseys":
    "Lightweight, quick-drying jersey with breathable mesh panels and a relaxed athletic fit. Built for match day and hard training sessions.",
  "cricket-jerseys":
    "Breathable cricket jersey with moisture-wicking fabric and a comfortable fit that keeps you cool through long innings.",
  "track-pants":
    "Stretch-woven track pants with an elasticated waist, tapered leg and zip side pockets. Move freely through every session.",
  shorts:
    "Lightweight training shorts with an elasticated waist and quick-dry fabric for unrestricted movement.",
  bags:
    "Durable, water-resistant bag with a roomy main compartment and padded straps for training and everyday carry.",
  socks:
    "Cushioned performance socks with arch support and moisture-wicking yarn to keep your feet dry and blister-free.",
  caps:
    "Structured six-panel cap with an adjustable strap and breathable eyelets for all-day comfort in the sun.",
  gloves:
    "Latex palm and padded backhand for confident, secure handling in wet or dry conditions.",
};

const describe = (product: SeedProduct): string =>
  `${product.name} — ${
    descriptionTemplates[product.categorySlug] ??
    "Quality sports gear built for comfort and performance."
  }`;

async function upsertCategories(): Promise<Map<string, number>> {
  const ids = new Map<string, number>();

  // Parents first so children can reference them.
  for (const category of seedCategories.filter((c) => c.parentSlug === null)) {
    const record = await prisma.category.upsert({
      where: { slug: category.slug },
      update: {
        name: category.name,
        sortOrder: category.sortOrder,
        image: category.image,
      },
      create: {
        slug: category.slug,
        name: category.name,
        sortOrder: category.sortOrder,
        image: category.image,
      },
    });
    ids.set(category.slug, record.id);
  }

  for (const category of seedCategories.filter((c) => c.parentSlug !== null)) {
    const parentId = ids.get(category.parentSlug as string) ?? null;
    const record = await prisma.category.upsert({
      where: { slug: category.slug },
      update: {
        name: category.name,
        sortOrder: category.sortOrder,
        image: category.image,
        parentId,
      },
      create: {
        slug: category.slug,
        name: category.name,
        sortOrder: category.sortOrder,
        image: category.image,
        parentId,
      },
    });
    ids.set(category.slug, record.id);
  }

  return ids;
}

async function upsertSettings(): Promise<void> {
  for (const [key, value] of Object.entries(seedSettings)) {
    const jsonValue = value as Prisma.InputJsonValue;
    await prisma.setting.upsert({
      where: { key },
      update: { value: jsonValue },
      create: { key, value: jsonValue },
    });
  }
}

async function upsertBanners(): Promise<void> {
  for (const banner of seedBanners) {
    const data = {
      title: banner.title,
      subtitle: banner.subtitle,
      imageUrl: banner.imageUrl,
      linkUrl: banner.linkUrl,
      sortOrder: banner.sortOrder,
      isActive: banner.isActive,
    };
    await prisma.banner.upsert({
      where: { id: banner.id },
      update: data,
      create: { id: banner.id, ...data },
    });
  }
}

async function upsertProducts(categoryIds: Map<string, number>): Promise<void> {
  let variantCount = 0;

  for (let productIndex = 0; productIndex < seedProducts.length; productIndex++) {
    const product = seedProducts[productIndex];
    const categoryId = categoryIds.get(product.categorySlug);

    if (!categoryId) {
      throw new Error(
        `Seed error: category "${product.categorySlug}" not found for product "${product.slug}".`,
      );
    }

    const record = await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        name: product.name,
        description: describe(product),
        brand: product.brand,
        gender: product.gender,
        categoryId,
        basePrice: product.basePrice,
        salePrice: product.salePrice,
        isActive: true,
        isFeatured: product.isFeatured,
      },
      create: {
        slug: product.slug,
        name: product.name,
        description: describe(product),
        brand: product.brand,
        gender: product.gender,
        categoryId,
        basePrice: product.basePrice,
        salePrice: product.salePrice,
        isActive: true,
        isFeatured: product.isFeatured,
      },
    });

    let variantIndex = 0;
    for (const size of product.sizes) {
      for (const color of product.colors) {
        const sku = `${product.slug}-${size}-${slugify(color.name)}`.toUpperCase();
        await prisma.productVariant.upsert({
          where: {
            productId_size_color: {
              productId: record.id,
              size,
              color: color.name,
            },
          },
          update: {
            sku,
            colorHex: color.hex,
            stock: stockFor(productIndex, variantIndex),
          },
          create: {
            productId: record.id,
            size,
            color: color.name,
            colorHex: color.hex,
            sku,
            stock: stockFor(productIndex, variantIndex),
          },
        });
        variantIndex++;
        variantCount++;
      }
    }

    // Images have no natural key, so replace them for this product on every run.
    await prisma.productImage.deleteMany({ where: { productId: record.id } });
    await prisma.productImage.createMany({
      data: product.colors.map((color, index) => ({
        productId: record.id,
        url: `https://placehold.co/800x1000/png?text=${encodeURIComponent(
          `${product.name} - ${color.name}`,
        )}`,
        publicId: `${product.slug}-${slugify(color.name)}`,
        color: color.name,
        sortOrder: index,
      })),
    });
  }

  console.log(`  Products: ${seedProducts.length}, variants: ${variantCount}`);
}

/** Create (or promote) the store admin from ADMIN_EMAIL / ADMIN_PASSWORD. */
async function ensureAdmin(): Promise<void> {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.log("  Admin: skipped (ADMIN_EMAIL / ADMIN_PASSWORD not set)");
    return;
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    // Never reset an existing admin's password on re-run.
    if (existing.role !== "admin") {
      await prisma.user.update({ where: { email }, data: { role: "admin" } });
      console.log(`  Admin: promoted existing user ${email} to admin`);
    } else {
      console.log(`  Admin: ${email} already exists (left unchanged)`);
    }
    return;
  }

  const result = await seedAuth.api.signUpEmail({
    body: { email, password, name: "Store Admin" },
  });

  if (!result?.user?.id) {
    throw new Error(`Admin signup did not return a user for ${email}.`);
  }

  await prisma.user.update({
    where: { id: result.user.id },
    data: { role: "admin" },
  });
  console.log(`  Admin: created ${email}`);
}

async function main(): Promise<void> {
  console.log("Seeding trio-sportsbd...");

  const categoryIds = await upsertCategories();
  console.log(`  Categories: ${categoryIds.size}`);

  await upsertSettings();
  console.log(`  Settings: ${Object.keys(seedSettings).length}`);

  await upsertBanners();
  console.log(`  Banners: ${seedBanners.length}`);

  await upsertProducts(categoryIds);

  await ensureAdmin();

  console.log("Seed complete.");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
