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
        An order is confirmed only after we receive the {settings.advancePercent}
        % advance and verify it. Until then, prices and stock may change. We may
        cancel an order if an item is out of stock or if the advance is not
        received; any advance paid is then returned in full.
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
