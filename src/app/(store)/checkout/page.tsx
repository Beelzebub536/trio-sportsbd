import type { Metadata } from "next";

import CheckoutForm, {
  type SavedAddress,
} from "@/components/checkout/CheckoutForm";
import prisma from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Checkout",
};

export default async function CheckoutPage() {
  const [settings, session] = await Promise.all([getSettings(), requireUser()]);

  const addresses: SavedAddress[] = await prisma.address.findMany({
    where: { userId: session.user.id },
    orderBy: [{ isDefault: "desc" }, { id: "asc" }],
    select: {
      id: true,
      fullName: true,
      phone: true,
      division: true,
      district: true,
      upazila: true,
      line1: true,
      isDefault: true,
    },
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold leading-none md:text-4xl">
        Checkout
      </h1>
      <CheckoutForm settings={settings} addresses={addresses} />
    </div>
  );
}
