import { MessageCircle } from "lucide-react";

import { whatsappHref, WHATSAPP_GENERIC_MESSAGE } from "@/lib/contact/channels";

export function WhatsAppLink({
  message = WHATSAPP_GENERIC_MESSAGE,
  elevated = false,
}: {
  message?: string;
  elevated?: boolean;
}) {
  const href = whatsappHref(message);
  if (!href) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contacter Tourcoin sur WhatsApp"
      className={`fixed right-3 z-40 inline-flex size-12 items-center justify-center rounded-full bg-[#25D366] text-[#07180d] shadow-premium transition-colors hover:bg-[#4be07f] sm:right-4 ${elevated ? "bottom-24" : "bottom-[max(0.75rem,env(safe-area-inset-bottom))] sm:bottom-5"}`}
    >
      <MessageCircle aria-hidden="true" />
      <span className="sr-only">WhatsApp</span>
    </a>
  );
}
