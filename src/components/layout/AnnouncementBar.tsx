import { formatBDT } from "@/lib/format";

export default function AnnouncementBar({
  freeShippingThreshold,
  whatsappNumber,
  onlinePaymentsEnabled,
}: {
  freeShippingThreshold: number;
  whatsappNumber: string;
  onlinePaymentsEnabled: boolean;
}) {
  const messages = [
    <span key="ship">Free delivery on orders over {formatBDT(freeShippingThreshold)}</span>,
    <span key="pay">
      {onlinePaymentsEnabled ? "Cash on delivery or online payment" : "Cash on delivery across Bangladesh"}
    </span>,
    <a
      key="wa"
      href={`https://wa.me/${whatsappNumber}`}
      target="_blank"
      rel="noopener noreferrer"
      className="underline underline-offset-2 hover:no-underline"
    >
      Questions? WhatsApp us
    </a>,
  ];

  return (
    <div className="bg-primary text-xs font-semibold text-primary-foreground">
      {/* Phones: one line that rotates; larger screens: all three side by side. */}
      <div className="rotate-msg grid h-9 place-items-center px-4 text-center md:hidden">
        {messages}
      </div>
      <div className="mx-auto hidden h-9 max-w-7xl items-center justify-center gap-10 px-4 md:flex">
        {messages}
      </div>
    </div>
  );
}
