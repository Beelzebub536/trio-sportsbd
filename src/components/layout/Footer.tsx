import Link from "next/link";
import { MessageCircle } from "lucide-react";

import { toWhatsAppNumber } from "@/lib/format";
import { FOOTER_LINKS } from "@/lib/nav";
import type { StoreSettings } from "@/lib/settings";

export default function Footer({ settings }: { settings: StoreSettings }) {
  const whatsapp = toWhatsAppNumber(settings.whatsappNumber);

  return (
    <footer className="mt-16 overflow-hidden border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 pt-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1fr]">
          <div>
            <p className="font-display text-3xl font-extrabold leading-none tracking-tight">
              Kit up for match day.
            </p>
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">{settings.storeAddress}</p>
            {settings.supportHours && (
              <p className="mt-1 max-w-xs text-sm text-muted-foreground">{settings.supportHours}</p>
            )}
            <a
              href={`https://wa.me/${whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="press mt-5 inline-flex h-12 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground hover:brightness-110"
            >
              <MessageCircle className="h-5 w-5" aria-hidden />
              WhatsApp {settings.whatsappNumber}
            </a>
          </div>

          {FOOTER_LINKS.map((column) => (
            <div key={column.heading}>
              <h2 className="text-xl font-bold">{column.heading}</h2>
              <ul className="mt-3">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="inline-block py-1.5 text-sm text-muted-foreground hover:text-foreground hover:underline"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p
          aria-hidden
          className="mt-12 select-none font-display text-[26vw] font-extrabold leading-[0.75] tracking-tight text-foreground/[0.04] lg:text-[18rem]"
        >
          Trio
        </p>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {settings.storeName}
          </p>
          <p>
            {settings.onlinePaymentsEnabled
              ? "Cash on delivery and online payment"
              : "Cash on delivery, confirmed on WhatsApp"}
          </p>
        </div>
      </div>
    </footer>
  );
}
