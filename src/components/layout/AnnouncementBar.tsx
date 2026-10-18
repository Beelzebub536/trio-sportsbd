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
  return (
    <div className="bg-black text-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-4 gap-y-1 px-4 py-2 text-center text-[11px] uppercase tracking-widest md:text-xs">
        <span>Free delivery on orders over {formatBDT(freeShippingThreshold)}</span>
        <span aria-hidden className="hidden text-white/40 md:inline">
          |
        </span>
        <span>
          {onlinePaymentsEnabled
            ? "Cash on delivery · online payment at checkout"
            : "Cash on delivery · WhatsApp order confirmation"}
        </span>
        <span aria-hidden className="hidden text-white/40 md:inline">
          |
        </span>
        <a
          href={`https://wa.me/${whatsappNumber}`}
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:no-underline"
        >
          WhatsApp us
        </a>
      </div>
    </div>
  );
}
