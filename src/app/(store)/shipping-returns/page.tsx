import type { Metadata } from "next";
import Link from "next/link";

import StaticPage from "@/components/layout/StaticPage";
import { formatBDT, toWhatsAppNumber } from "@/lib/format";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Shipping & returns",
  description: "Delivery times, cash on delivery and the 7-day return policy.",
};

export default async function ShippingReturnsPage() {
  const settings = await getSettings();

  return (
    <StaticPage
      title="Shipping & returns"
      intro="Where we deliver, what it costs and how returns work."
    >
      <h2>Delivery times</h2>
      <ul>
        <li>
          <strong>Inside Dhaka:</strong> 1–2 working days.
        </li>
        <li>
          <strong>Outside Dhaka:</strong> 2–4 working days.
        </li>
      </ul>

      <h2>Delivery charges</h2>
      <ul>
        <li>Inside Dhaka: {formatBDT(settings.shippingInsideDhaka)}</li>
        <li>Outside Dhaka: {formatBDT(settings.shippingOutsideDhaka)}</li>
        <li>
          Free delivery on orders over{" "}
          {formatBDT(settings.freeShippingThreshold)}
        </li>
      </ul>

      <h2>Payment</h2>
      {settings.onlinePaymentsEnabled ? (
        <p>
          At checkout, choose full online payment or pay a{" "}
          <strong>{settings.advancePercent}% advance</strong> by bKash or Nagad
          (store numbers: {settings.bkashNumber} / {settings.nagadNumber}) and
          pay the remaining balance in cash on delivery. Online payments are
          manually verified before the order is confirmed.
        </p>
      ) : (
        <p>
          Cash on delivery is available. Submit your order request and contact
          us on WhatsApp; we will confirm availability and delivery before
          dispatch.
        </p>
      )}

      <h2>Returns</h2>
      <p>
        Unused items with their original tags can be returned within{" "}
        <strong>7 days</strong> of delivery. Message us on WhatsApp to start a
        return; we will arrange a pickup where possible. Items that have been
        worn, washed or damaged are not eligible.
      </p>
      <p>
        Advance payments are non-refundable if an order is cancelled after the
        parcel has been dispatched. If we cancel your order, or a product is
        out of stock, the advance is returned in full.
      </p>

      <h2>Problems with a delivery</h2>
      <p>
        If something is wrong,{" "}
        <a
          href={`https://wa.me/${toWhatsAppNumber(settings.whatsappNumber)}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          message us on WhatsApp
        </a>{" "}
        within 48 hours so we can fix it quickly. You can also review the{" "}
        <Link href="/size-guide">size guide</Link> to avoid size exchanges.
      </p>
    </StaticPage>
  );
}
