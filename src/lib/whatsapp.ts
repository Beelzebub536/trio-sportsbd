import { formatBDT, toWhatsAppNumber } from "@/lib/format";

export type WhatsAppOrder = {
  orderNumber: string;
  customerName: string;
  phone: string;
  address: string;
  upazila: string;
  district: string;
  division: string;
  total: number;
  advanceAmount: number;
  advanceMethod: string | null;
  advanceTrxId: string | null;
  items: Array<{ name: string; size: string; color: string; qty: number }>;
};

export function orderStatusMessage(order: WhatsAppOrder): string {
  const lines = [
    `Hi, I just placed an order on Trio Sports BD.`,
    ``,
    `Order: ${order.orderNumber}`,
    `Name: ${order.customerName}`,
    `Phone: ${order.phone}`,
    `Address: ${order.address}, ${order.upazila}, ${order.district}, ${order.division}`,
    ``,
    `Items:`,
    ...order.items.map(
      (item) => `• ${item.name} (${item.color} / ${item.size}) x${item.qty}`,
    ),
    ``,
    `Total: ${formatBDT(order.total)}`,
    order.advanceAmount === 0
      ? "Payment: cash on delivery — please review and confirm this order request."
      : order.advanceAmount >= order.total
        ? `Payment: full prepayment (${order.advanceMethod ?? "bKash/Nagad"}) — ${formatBDT(order.advanceAmount)}${order.advanceTrxId ? ` — TrxID ${order.advanceTrxId}` : ""}`
        : `Advance (${order.advanceMethod ?? "bKash/Nagad"}): ${formatBDT(order.advanceAmount)}${order.advanceTrxId ? ` — TrxID ${order.advanceTrxId}` : ""}`,
    ``,
    `Please confirm my order. Thank you!`,
  ];

  return lines.join("\n");
}

export function buildWhatsAppLink(
  storeNumber: string,
  message: string,
): string {
  return `https://wa.me/${toWhatsAppNumber(storeNumber)}?text=${encodeURIComponent(
    message,
  )}`;
}
