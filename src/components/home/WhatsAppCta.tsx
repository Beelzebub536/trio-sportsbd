import { MessageCircle } from "lucide-react";

import { toWhatsAppNumber } from "@/lib/format";

export default function WhatsAppCta({
  whatsappNumber,
  supportHours,
}: {
  whatsappNumber: string;
  supportHours: string;
}) {
  const number = toWhatsAppNumber(whatsappNumber);
  const message = encodeURIComponent(
    "Hi Trio Sports BD, I have a question about a product.",
  );

  return (
    <section className="mx-auto max-w-7xl px-4 py-12">
      <div className="flex flex-col items-start gap-5 border border-border p-6 md:flex-row md:items-center md:justify-between md:p-10">
        <div className="flex items-start gap-4">
          <MessageCircle className="mt-1 h-7 w-7 shrink-0" aria-hidden />
          <div>
            <h2 className="text-2xl font-bold uppercase leading-none md:text-3xl">
              Need help choosing?
            </h2>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
              Message us on WhatsApp — sizes, stock, delivery or bulk orders.
              {supportHours ? ` We reply ${supportHours}.` : ""}
            </p>
          </div>
        </div>
        <a
          href={`https://wa.me/${number}?text=${message}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center gap-2 bg-black px-6 py-3 text-xs font-bold uppercase tracking-widest text-white transition-opacity hover:opacity-90"
        >
          Chat on WhatsApp
        </a>
      </div>
    </section>
  );
}
