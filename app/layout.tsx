import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import { isCanonicalProductionSite, resolvePublicSiteUrl } from "@/lib/auth/site-url";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const poppins = Poppins({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-poppins", display: "swap" });
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
  return <html lang="fr" className={`${inter.variable} ${poppins.variable}`}><body>{children}</body></html>;
}
