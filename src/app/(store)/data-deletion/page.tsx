import type { Metadata } from "next";

import StaticPage from "@/components/layout/StaticPage";
import { toWhatsAppNumber } from "@/lib/format";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Data deletion",
  description:
    "How to request deletion of your account and personal data from Trio Sports BD.",
};

export default async function DataDeletionPage() {
  const settings = await getSettings();
  const number = toWhatsAppNumber(settings.whatsappNumber);

  return (
    <StaticPage
      title="Data deletion request"
      intro="Ask us to delete your account and personal data."
    >
      <p>
        You can request deletion of your {settings.storeName} account and the
        personal data we hold about you at any time. This page explains exactly
        how, and what happens next.
      </p>

      <h2>How to request deletion</h2>
      <ol className="space-y-2">
        <li className="ml-5 list-decimal">
          Message us on WhatsApp at <strong>{settings.whatsappNumber}</strong>.
        </li>
        <li className="ml-5 list-decimal">
          Send the message: <em>“Please delete my account and personal data.”</em>
        </li>
        <li className="ml-5 list-decimal">
          Include the email address or phone number linked to your account so we
          can find it.
        </li>
      </ol>

      <p className="mt-4">
        <a
          href={`https://wa.me/${number}?text=${encodeURIComponent(
            "Please delete my account and personal data.",
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-black px-5 py-3 text-xs font-bold uppercase tracking-widest text-white no-underline hover:opacity-90"
        >
          Send the request on WhatsApp
        </a>
      </p>

      <h2>What we delete</h2>
      <ul>
        <li>Your account, email address, name and login credentials.</li>
        <li>Saved addresses and your wishlist.</li>
        <li>Any social-login links (Google/Facebook).</li>
      </ul>

      <h2>What we must keep</h2>
      <p>
        We keep the minimum order records required for accounting and to honour
        returns and warranty claims. These records are retained only as long as
        the law requires and are then deleted.
      </p>

      <h2>Timeline</h2>
      <p>
        We confirm receipt on WhatsApp and complete deletion within 7 working
        days. Once your account is deleted you will be signed out and will need
        to create a new account to shop again.
      </p>
    </StaticPage>
  );
}
