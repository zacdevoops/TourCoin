"use client";

import { usePathname } from "next/navigation";

import { WhatsAppLink } from "@/components/layout/whatsapp-link";

export function WhatsAppAction() {
  const pathname = usePathname();
  if (pathname === "/contact" || /^\/cars\/[^/]+$/.test(pathname)) return null;
  return <WhatsAppLink />;
}
