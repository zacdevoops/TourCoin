import { MessageCircle } from "lucide-react";

import { whatsappHref } from "@/lib/contact/channels";

export function WhatsAppAction() {
  const href = whatsappHref();
  if (!href) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contacter Tourcoin sur WhatsApp"
      className="fixed right-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-40 inline-flex size-12 items-center justify-center rounded-full bg-[#25D366] font-bold text-[#07180d] shadow-premium hover:bg-[#4be07f] sm:right-4 sm:bottom-5 sm:h-12 sm:w-auto sm:gap-2 sm:px-4"
    >
      <MessageCircle aria-hidden="true" />
      <span className="hidden sm:inline">WhatsApp</span>
    </a>
  );
}
