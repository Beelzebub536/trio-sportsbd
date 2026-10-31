import type { Metadata } from "next";
import Link from "next/link";

import StaticPage from "@/components/layout/StaticPage";
import { toWhatsAppNumber } from "@/lib/format";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Contact us",
  description: "Reach Trio Sports BD on WhatsApp.",
};

export default async function ContactPage() {
  const settings = await getSettings();
  const number = toWhatsAppNumber(settings.whatsappNumber);

  return (
    <StaticPage
      title="Contact us"
      intro="We answer every question on WhatsApp — fast, and in English or Bangla."
    >
      <p>
        The quickest way to reach us is WhatsApp. We reply during{" "}
        <strong>{settings.supportHours}</strong>.
      </p>

      <p>
        <a
          href={`https://wa.me/${number}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground no-underline hover:brightness-110"
        >
          Chat on WhatsApp
        </a>
      </p>

      <h2>Other ways</h2>
      <ul>
        <li>
          WhatsApp number: <strong>{settings.whatsappNumber}</strong>
        </li>
        <li>
          Address: <strong>{settings.storeAddress}</strong>
        </li>
        <li>Support hours: {settings.supportHours}</li>
      </ul>

      <h2>Track an existing order</h2>
      <p>
        Already ordered? Use the <Link href="/track">order tracking page</Link>{" "}
        with your order number and phone number.
      </p>
    </StaticPage>
  );
}
