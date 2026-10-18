import Link from "next/link";

import { toWhatsAppNumber } from "@/lib/format";
import { FOOTER_LINKS } from "@/lib/nav";
import type { StoreSettings } from "@/lib/settings";

export default function Footer({ settings }: { settings: StoreSettings }) {
  const whatsapp = toWhatsAppNumber(settings.whatsappNumber);

  return (
    <footer className="mt-16 border-t border-border bg-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        {FOOTER_LINKS.map((column) => (
          <div key={column.heading}>
            <h2 className="text-sm font-bold uppercase tracking-widest">
              {column.heading}
            </h2>
            <ul className="mt-4 space-y-2">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground hover:underline"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div>
          <h2 className="text-sm font-bold uppercase tracking-widest">
            {settings.storeName}
          </h2>
          <p className="mt-4 text-sm text-muted-foreground">
            {settings.storeAddress}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">{settings.supportHours}</p>
          <a
            href={`https://wa.me/${whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block text-sm font-semibold underline underline-offset-4 hover:decoration-2"
          >
            WhatsApp: {settings.whatsappNumber}
          </a>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {settings.storeName}. All rights reserved.
          </p>
          <p className="uppercase tracking-wide">
            {settings.onlinePaymentsEnabled
              ? "Cash on delivery · online payment at checkout"
              : "Cash on delivery · WhatsApp order confirmation"}
          </p>
        </div>
      </div>
    </footer>
  );
}
