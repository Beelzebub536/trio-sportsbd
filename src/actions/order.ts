"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { headers } from "next/headers";

import { effectivePrice } from "@/lib/format";
import { PRODUCT_DETAIL_TAG } from "@/lib/cache-tags";
import { signOrderToken } from "@/lib/order-token";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { getSettings } from "@/lib/settings";
import { expireUnverifiedOnlineOrders } from "@/lib/order-expiry";
import { checkoutSchema, type CheckoutValues } from "@/lib/validators/order";

export type PlaceOrderResult =
  | { ok: true; orderNumber: string; token: string }
  | { ok: false; error: string };

const randomDigits = (): number => Math.floor(1000 + Math.random() * 9000);

const makeOrderNumber = (): string => {
  const now = new Date();
  const year = String(now.getFullYear()).slice(2);
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `TS-${year}${month}${day}-${randomDigits()}`;
};

const RATE_LIMIT_PER_HOUR = 5;
const RATE_LIMIT_PER_IP_PER_HOUR = 20;
const ipOrderAttempts = new Map<string, number[]>();

function coarseClientIp(value: string): string | null {
  const ip = value.trim().toLowerCase().replace(/^\[|\]$/g, "");
  const ipv4 = ip.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.\d{1,3}$/);
  if (ipv4 && ipv4.slice(1).every((octet) => Number(octet) <= 255)) {
    return ipv4[1] + "." + ipv4[2] + "." + ipv4[3] + ".0/24";
  }
  if (ip.includes(":")) {
    const address = ip.split("%")[0];
    const [left = "", right = ""] = address.split("::");
    const leftParts = left ? left.split(":") : [];
    const rightParts = right ? right.split(":") : [];
    const missingParts = 8 - leftParts.length - rightParts.length;
    const parts = address.includes("::")
      ? [...leftParts, ...Array(Math.max(0, missingParts)).fill("0"), ...rightParts]
      : leftParts;
    if (parts.length === 8 && parts.every((part) => /^[a-f0-9]{1,4}$/.test(part))) {
      return parts.slice(0, 4).join(":") + "::/64";
    }
  }
  return null;
}

function allowIpOrder(ip: string | null): boolean {
  if (!ip) return true;
  const now = Date.now();
  const cutoff = now - 60 * 60 * 1000;
  for (const [key, timestamps] of ipOrderAttempts) {
    const recent = timestamps.filter((timestamp) => timestamp > cutoff);
    if (recent.length === 0) ipOrderAttempts.delete(key);
    else ipOrderAttempts.set(key, recent);
  }

  const attempts = ipOrderAttempts.get(ip) ?? [];
  if (attempts.length >= RATE_LIMIT_PER_IP_PER_HOUR) return false;
  attempts.push(now);
  ipOrderAttempts.set(ip, attempts);
  return true;
}

export async function placeOrder(
  input: CheckoutValues,
): Promise<PlaceOrderResult> {
  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.errors[0]?.message ?? "Please check the form.",
    };
  }
  const values = parsed.data;

  const requestHeaders = await headers();
  const rawIp =
    requestHeaders.get("x-real-ip") ??
    requestHeaders.get("x-forwarded-for")?.split(",")[0] ??
    "";
  if (!allowIpOrder(coarseClientIp(rawIp))) {
    return {
      ok: false,
      error:
        "Too many orders from this network recently. Please message us on WhatsApp.",
    };
  }

  const [settings, session] = await Promise.all([getSettings(), getSession()]);

  if (
    (settings.onlinePaymentsEnabled && values.paymentMode === "MANUAL") ||
    (!settings.onlinePaymentsEnabled && values.paymentMode !== "MANUAL")
  ) {
    return {
      ok: false,
      error: "Checkout payment options changed. Refresh and try again.",
    };
  }

  if (values.paymentMode !== "MANUAL") {
    const receivingNumber =
      values.advanceMethod === "NAGAD"
        ? settings.nagadNumber
        : settings.bkashNumber;
    if (!receivingNumber.trim() || receivingNumber === "01700000000") {
      return {
        ok: false,
        error: "Online payment is not configured yet. Please choose COD or contact the store.",
      };
    }
  }

  // Cron runs once daily on the free deployment tier, so clean up lazily too.
  await expireUnverifiedOnlineOrders();

  const openOrder = await prisma.order.findFirst({
    where: { phone: values.phone, status: "PENDING" },
    select: { orderNumber: true },
  });
  if (openOrder) {
    return {
      ok: false,
      error: `You already have an order awaiting confirmation (${openOrder.orderNumber}). Please contact us if you need help.`,
    };
  }

  if (values.paymentMode !== "MANUAL") {
    const duplicateTrx = await prisma.order.findFirst({
      where: {
        advanceMethod: values.advanceMethod,
        advanceTrxId: { equals: values.advanceTrxId, mode: "insensitive" },
      },
      select: { orderNumber: true },
    });
    if (duplicateTrx) {
      return {
        ok: false,
        error: "This transaction ID has already been submitted. Check it and contact us if you believe this is an error.",
      };
    }
  }

  // Persisted per-phone limit plus a coarse, best-effort per-IP limit above.
  const recent = await prisma.order.count({
    where: {
      phone: values.phone,
      status: { notIn: ["CANCELLED", "RETURNED"] },
      createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) },
    },
  });
  if (recent >= RATE_LIMIT_PER_HOUR) {
    return {
      ok: false,
      error:
        "Too many orders from this number recently. Please message us on WhatsApp.",
    };
  }

  const variantIds = [...new Set(values.items.map((item) => item.variantId))];
  const variants = await prisma.productVariant.findMany({
    where: { id: { in: variantIds } },
    include: {
      product: { include: { images: { orderBy: { sortOrder: "asc" } } } },
    },
  });
  const byId = new Map(variants.map((variant) => [variant.id, variant]));

  type Line = {
    variantId: number;
    productId: number;
    name: string;
    size: string;
    color: string;
    image: string | null;
    unitPrice: number;
    qty: number;
  };

  const lines: Line[] = [];
  for (const item of values.items) {
    const variant = byId.get(item.variantId);
    if (!variant || !variant.product.isActive) {
      return {
        ok: false,
        error: "One of the items is no longer available. Please review your bag.",
      };
    }
    if (variant.stock < item.qty) {
      return {
        ok: false,
        error: `Only ${variant.stock} left of ${variant.product.name} (${variant.size}).`,
      };
    }

    lines.push({
      variantId: variant.id,
      productId: variant.productId,
      name: variant.product.name,
      size: variant.size,
      color: variant.color,
      image:
        variant.product.images.find((image) => image.color === variant.color)
          ?.url ??
        variant.product.images[0]?.url ??
        null,
      unitPrice: effectivePrice(
        variant.product.basePrice,
        variant.product.salePrice,
      ),
      qty: item.qty,
    });
  }

  const subtotal = lines.reduce(
    (sum, line) => sum + line.unitPrice * line.qty,
    0,
  );
  const insideDhaka = values.division === "Dhaka";
  let shippingFee = insideDhaka
    ? settings.shippingInsideDhaka
    : settings.shippingOutsideDhaka;
  if (subtotal >= settings.freeShippingThreshold) shippingFee = 0;

  const total = subtotal + shippingFee;
  const advanceAmount =
    values.paymentMode === "FULL"
      ? total
      : values.paymentMode === "ADVANCE"
        ? Math.ceil((total * settings.advancePercent) / 100)
        : 0;

  try {
    const created = await prisma.$transaction(async (tx) => {
      if (values.paymentMode !== "MANUAL") {
        for (const line of lines) {
          const result = await tx.productVariant.updateMany({
            where: { id: line.variantId, stock: { gte: line.qty } },
            data: { stock: { decrement: line.qty } },
          });
          if (result.count === 0) {
            throw new Error(`STOCK:${line.name}`);
          }
        }
      }

      let orderNumber = makeOrderNumber();
      let attempts = 0;
      while (attempts < 5) {
        const exists = await tx.order.findUnique({
          where: { orderNumber },
          select: { id: true },
        });
        if (!exists) break;
        orderNumber = makeOrderNumber();
        attempts += 1;
      }

      return tx.order.create({
        data: {
          orderNumber,
          userId: session?.user?.id ?? null,
          customerName: values.fullName,
          phone: values.phone,
          division: values.division,
          district: values.district,
          upazila: values.upazila,
          address: values.address,
          note: values.note ? values.note : null,
          subtotal,
          shippingFee,
          total,
          advanceAmount,
          advanceMethod:
            values.paymentMode === "MANUAL" ? null : values.advanceMethod,
          advanceTrxId:
            values.paymentMode === "MANUAL" ? null : values.advanceTrxId,
          advanceSenderNumber:
            values.paymentMode === "MANUAL"
              ? null
              : values.advanceSenderNumber,
          orderItems: {
            create: lines.map((line) => ({
              variantId: line.variantId,
              productId: line.productId,
              name: line.name,
              size: line.size,
              color: line.color,
              image: line.image,
              unitPrice: line.unitPrice,
              qty: line.qty,
            })),
          },
        },
        select: { orderNumber: true },
      });
    });

    revalidatePath("/admin");
    revalidatePath("/admin/orders");
    revalidateTag(PRODUCT_DETAIL_TAG);

    return {
      ok: true,
      orderNumber: created.orderNumber,
      token: signOrderToken(created.orderNumber),
    };
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return {
        ok: false,
        error: "This transaction ID has already been submitted. Check it and contact us if you believe this is an error.",
      };
    }
    if (error instanceof Error && error.message.startsWith("STOCK:")) {
      return {
        ok: false,
        error:
          "Sorry, one of your items sold out while you were checking out. Please review your bag.",
      };
    }
    console.error("placeOrder failed:", error);
    return {
      ok: false,
      error:
        "We could not place your order. Please try again, or message us on WhatsApp.",
    };
  }
}
