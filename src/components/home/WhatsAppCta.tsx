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
  const message = encodeURIComponent("Hi Trio Sports BD, I have a question about a product.");

  return (
    <section className="mx-auto max-w-7xl px-4 pb-4 pt-4">
      <div className="floodlight flex flex-col items-start gap-6 rounded-3xl border border-border p-6 md:flex-row md:items-center md:justify-between md:p-10">
        <div>
          <h2 className="text-3xl md:text-4xl">Not sure about your size?</h2>
          <p className="mt-2 max-w-xl text-base text-muted-foreground">
            Message us on WhatsApp about sizes, stock, delivery or team orders.
            {supportHours ? ` We reply ${supportHours}.` : ""}
          </p>
        </div>
        <a
          href={`https://wa.me/${number}?text=${message}`}
          target="_blank"
          rel="noopener noreferrer"
          className="press inline-flex h-14 shrink-0 items-center gap-2 rounded-full bg-primary px-7 text-base font-semibold text-primary-foreground hover:brightness-110"
        >
          <MessageCircle className="h-5 w-5" aria-hidden />
          Chat on WhatsApp
        </a>
      </div>
    </section>
  );
}
