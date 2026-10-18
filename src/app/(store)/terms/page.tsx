import type { Metadata } from "next";

import StaticPage from "@/components/layout/StaticPage";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Terms & conditions",
  description: "The terms that apply when you order from Trio Sports BD.",
};

export default async function TermsPage() {
  const settings = await getSettings();

  return (
    <StaticPage
      title="Terms & conditions"
      intro="Plain-language terms for shopping with us."
    >
      <h2>Orders</h2>
      <p>
        {settings.onlinePaymentsEnabled
          ? `Online payment details are checked before an order is confirmed. At checkout, you can pay in full or pay a ${settings.advancePercent}% advance and the balance on delivery. If an item is unavailable, contact us on WhatsApp to arrange a refund for any payment received.`
          : "Orders are requests until our team confirms availability and delivery with you, usually on WhatsApp. No online payment is requested while online payments are disabled."} Until confirmation, stock may change.
      </p>

      <h2>Prices</h2>
      <p>
        All prices are in Bangladeshi Taka (৳) and include applicable taxes.
        Delivery charges are added at checkout.
      </p>

      <h2>Delivery</h2>
      <p>
        Estimated delivery is 1–2 days inside Dhaka and 2–4 days elsewhere.
        Delays caused by the courier, weather or public holidays are outside our
        control, but we will keep you informed on WhatsApp.
      </p>

      <h2>Returns and exchanges</h2>
      <p>
        Unused items with tags may be returned within 7 days. See the{" "}
        <a href="/shipping-returns">shipping &amp; returns</a> page for details.
        Size exchanges are subject to stock availability.
      </p>

      <h2>Accounts</h2>
      <p>
        Keep your password private. You are responsible for activity on your
        account. We may suspend accounts used for fraudulent orders or abusive
        behaviour.
      </p>

      <h2>Liability</h2>
      <p>
        Our liability for any order is limited to the amount you paid for that
        order. Nothing in these terms removes rights you have under Bangladeshi
        consumer law.
      </p>

      <h2>Governing law</h2>
      <p>These terms are governed by the laws of Bangladesh.</p>
    </StaticPage>
  );
}
