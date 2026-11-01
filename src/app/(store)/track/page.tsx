import type { Metadata } from "next";

import TrackForm from "@/components/order/TrackForm";

export const metadata: Metadata = {
  title: "Track your order",
  description: "Check the status of an order with your order number and phone.",
};

export default function TrackPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-bold leading-none md:text-4xl">
        Track your order
      </h1>
      <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
        Enter the order number from your confirmation and the phone number you
        used at checkout.
      </p>
      <div className="mt-8">
        <TrackForm />
      </div>
    </div>
  );
}
