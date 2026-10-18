"use client";

import { useState } from "react";
import { toast } from "sonner";

import { trackOrder, type TrackedOrder } from "@/actions/track";
import OrderStatusBadge from "@/components/order/OrderStatusBadge";
import OrderTimeline from "@/components/order/OrderTimeline";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import LoadingSurface from "@/components/ui/LoadingSurface";
import { formatBDT } from "@/lib/format";

export default function TrackForm() {
  const [orderNumber, setOrderNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TrackedOrder | null>(null);
  const [searched, setSearched] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      const order = await trackOrder(orderNumber, phone);
      setResult(order);
      setSearched(true);
      if (!order) {
        toast.error("No order found for that number and phone.");
      }
    } catch {
      toast.error("Could not look up that order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <LoadingSurface className="min-h-48 max-w-xl" label="Looking up order" active={loading}>
      <form onSubmit={handleSubmit} className="grid max-w-xl gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="orderNumber">Order number</Label>
          <Input
            id="orderNumber"
            placeholder="TS-240615-4827"
            value={orderNumber}
            onChange={(event) => setOrderNumber(event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="trackPhone">Phone number</Label>
          <Input
            id="trackPhone"
            placeholder="01XXXXXXXXX"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
          />
        </div>
        <div className="sm:col-span-2">
          <Button type="submit" disabled={loading}>
            {loading ? "Looking up…" : "Track order"}
          </Button>
        </div>
      </form>
      </LoadingSurface>

      {searched && !result && (
        <p className="bg-secondary px-4 py-3 text-sm">
          We could not find an order with those details. Check the order number
          and phone number, or message us on WhatsApp.
        </p>
      )}

      {result && (
        <div className="max-w-2xl border border-border p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                Order {result.orderNumber}
              </p>
              <p className="text-lg font-bold uppercase">{result.customerName}</p>
            </div>
            <OrderStatusBadge status={result.status} />
          </div>

          <div className="mt-5">
            <OrderTimeline status={result.status} />
          </div>

          <ul className="mt-5 divide-y divide-border border-y border-border">
            {result.items.map((item, index) => (
              <li key={index} className="flex justify-between py-2 text-sm">
                <span>
                  {item.name} ({item.color} / {item.size})
                </span>
                <span className="text-muted-foreground">×{item.qty}</span>
              </li>
            ))}
          </ul>

          <dl className="mt-4 space-y-1 text-sm">
            <div className="flex justify-between">
              <dt>Total</dt>
              <dd className="font-semibold">{formatBDT(result.total)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>{result.advanceAmount === 0 ? "Due on delivery" : `Online payment (${result.advanceStatus.toLowerCase()})`}</dt>
              <dd>{formatBDT(result.advanceAmount)}</dd>
            </div>
          </dl>
        </div>
      )}
    </div>
  );
}
