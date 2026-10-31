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
    <section className="mx-auto max-w-7xl px-4 py-12 md:py-16">
      <div className="flex flex-col items-start gap-6 border-l-8 border-primary bg-white p-6 shadow-[0_12px_40px_hsl(var(--pitch-dark)/0.10)] md:flex-row md:items-center md:justify-between md:p-10">
        <div>
          <h2 className="text-4xl md:text-5xl">Not sure about your size?</h2>
          <p className="mt-2 max-w-xl text-base text-muted-foreground">
            Message us on WhatsApp about sizes, stock, delivery or team orders.
            {supportHours ? ` We reply ${supportHours}.` : ""}
          </p>
        </div>
        <a
          href={`https://wa.me/${number}?text=${message}`}
          target="_blank"
          rel="noopener noreferrer"
          className="press inline-flex h-14 shrink-0 items-center gap-2 bg-primary px-7 text-sm font-bold uppercase tracking-wide text-white hover:bg-pitch-dark"
        >
          <MessageCircle className="h-5 w-5" aria-hidden />
          Chat on WhatsApp
        </a>
      </div>
    </section>
  );
}
