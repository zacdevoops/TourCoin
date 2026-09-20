import { MessageCircle, Phone } from "lucide-react";

import { ButtonLink } from "@/components/ui/button-link";
import {
  getContactPhoneHref,
  whatsappHref,
  WHATSAPP_GENERIC_MESSAGE,
} from "@/lib/contact/channels";

const tones = {
  hero: "inline-flex min-h-12 items-center justify-center gap-2 rounded-sm border border-white/25 bg-white/10 px-6 py-3 text-sm font-bold text-white transition-colors hover:border-white hover:bg-white/15",
  light: "inline-flex min-h-12 items-center justify-center gap-2 rounded-sm border border-black/15 bg-white px-6 py-3 text-sm font-bold text-charcoal transition-colors hover:border-charcoal",
  solid: "inline-flex min-h-12 items-center justify-center gap-2 rounded-sm bg-charcoal px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-black",
} as const;

export function ContactChoices({
  message = WHATSAPP_GENERIC_MESSAGE,
  className = "",
  tone = "light",
}: {
  message?: string;
  className?: string;
  tone?: keyof typeof tones;
}) {
  const whatsapp = whatsappHref(message);
  const phone = getContactPhoneHref();
  const actionClass = tones[tone];

  if (!whatsapp && !phone) {
    return (
      <ButtonLink href="/contact" variant="outline" className={className}>
        Nous contacter
      </ButtonLink>
    );
  }

  return (
    <div className={`flex max-w-[calc(100%-4.75rem)] flex-wrap gap-3 md:max-w-none ${className}`.trim()}>
      {whatsapp ? (
        <a
          href={whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Contacter Tourcoin sur WhatsApp"
          className={actionClass}
        >
          <MessageCircle size={18} aria-hidden="true" />
          WhatsApp
        </a>
      ) : null}
      {phone ? (
        <a href={phone} aria-label="Appeler Tourcoin" className={actionClass}>
          <Phone size={18} aria-hidden="true" />
          Appeler
        </a>
      ) : null}
    </div>
  );
}
