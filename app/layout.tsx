import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import { isCanonicalProductionSite, resolvePublicSiteUrl } from "@/lib/auth/site-url";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});
const siteUrl = resolvePublicSiteUrl();
const allowIndexing = isCanonicalProductionSite(siteUrl);

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "Tourcoin — Location de voitures au Maroc", template: "%s | Tourcoin" },
  description: "Louez une voiture au Maroc avec Tourcoin : flotte sélectionnée, tarifs transparents et assistance locale.",
  alternates: { canonical: "/" },
  robots: allowIndexing
    ? { index: true, follow: true }
    : { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false, noimageindex: true } },
  openGraph: { type: "website", locale: "fr_MA", siteName: "Tourcoin", title: "Tourcoin — Location de voitures au Maroc", description: "Une flotte choisie avec soin pour découvrir le Maroc.", url: "/" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" data-scroll-behavior="smooth" className={`${manrope.variable} ${cormorant.variable}`}>
      <body>{children}</body>
    </html>
  );
}
