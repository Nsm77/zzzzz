import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import type { ReactNode } from "react";
import { ToasterProvider } from "@/components/ui/toaster";
import { CartProvider } from "@/components/cart/cart-provider";
import { SITE_NAME, SITE_URL } from "@/lib/env";
import "./globals.css";

const display = Cormorant_Garamond({ subsets: ["latin"], weight: ["400", "500", "600"], style: ["normal", "italic"], variable: "--font-display", display: "swap" });
const body = Inter({ subsets: ["latin"], variable: "--font-body", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_NAME, template: `%s — Cléopâtre` },
  description: "Parapharmacie premium à Ezzahra et Hammam-Lif. Dermo-cosmétique, solaire, compléments : produits authentiques, conseils de pharmaciens, livraison partout en Tunisie.",
  applicationName: "Cléopâtre",
  openGraph: { type: "website", locale: "fr_TN", siteName: SITE_NAME, images: ["/images/hero.jpg"] },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};
export const viewport: Viewport = { themeColor: "#f7f4ee", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr" dir="ltr" className={`${display.variable} ${body.variable}`}>
      <body className="min-h-dvh bg-paper text-charcoal">
        <ToasterProvider>
          <CartProvider>{children}</CartProvider>
        </ToasterProvider>
      </body>
    </html>
  );
}
