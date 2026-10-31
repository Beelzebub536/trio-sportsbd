import type { Metadata } from "next";
import { Archivo, Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { INTRO_BOOT } from "@/lib/intro";
import { SITE_DESCRIPTION, SITE_NAME, siteUrl } from "@/lib/seo";

const inter = Inter({ subsets: ["latin"], display: "swap" });
const display = Archivo({
  weight: ["700", "800"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: `${SITE_NAME} — Sports jerseys & activewear in Bangladesh`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "sports jersey",
    "jersey Bangladesh",
    "activewear",
    "trousers",
    "sports accessories",
    "cash on delivery",
  ],
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_US",
    url: siteUrl(),
    title: `${SITE_NAME} — Sports jerseys & activewear in Bangladesh`,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — Sports jerseys & activewear in Bangladesh`,
    description: SITE_DESCRIPTION,
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // suppressHydrationWarning: the intro boot script may add data-intro before hydration.
    <html lang="en" className={display.variable} suppressHydrationWarning>
      <body className={inter.className}>
        {/* Runs before first paint so returning visitors never see the intro flash. */}
        <Script id="intro-boot" strategy="beforeInteractive">
          {INTRO_BOOT}
        </Script>
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
