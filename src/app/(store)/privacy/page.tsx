import type { Metadata } from "next";

import StaticPage from "@/components/layout/StaticPage";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "How Trio Sports BD collects, uses and protects your data.",
};

export default async function PrivacyPage() {
  const settings = await getSettings();

  return (
    <StaticPage
      title="Privacy policy"
      intro="What we collect, why we collect it, and how to have it removed."
    >
      <h2>Information we collect</h2>
      <ul>
        <li>Name, phone number and delivery address for orders.</li>
        <li>
          Email address and (if you sign in with Google or Facebook) the basic
          profile those providers share.
        </li>
        <li>Order history, so you can track purchases and we can help you.</li>
        <li>
          A secure session cookie. We do not run advertising or analytics
          trackers.
        </li>
      </ul>

      <h2>How we use it</h2>
      <p>
        We use your details only to process and deliver orders, to contact you
        about an order on WhatsApp, and to keep your account secure. We never
        sell your data.
      </p>

      <h2>Payments</h2>
      <p>
        We do not store card or full mobile-wallet credentials. Advance
        payments are sent by you through bKash or Nagad; we only record the
        transaction ID you give us in order to verify the payment.
      </p>

      <h2>Sharing</h2>
      <p>
        We share the delivery name, address and phone number with our courier.
        No other third parties receive your personal data.
      </p>

      <h2>Security and retention</h2>
      <p>
        Data is stored with our hosting and database providers on encrypted
        connections. We keep order records for accounting, and account details
        until you ask us to delete them.
      </p>

      <h2>Your choices</h2>
      <p>
        You can request a copy of your data, correct it, or ask us to delete
        your account by messaging {settings.storeName} on WhatsApp. See the{" "}
        <a href="/data-deletion">data deletion page</a> for the exact steps.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about privacy? Message us on WhatsApp at{" "}
        {settings.whatsappNumber}.
      </p>
    </StaticPage>
  );
}
