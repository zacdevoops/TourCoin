import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Administration | Tourcoin",
    template: "%s | Tourcoin Admin",
  },
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
};

export default function AdminRootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
