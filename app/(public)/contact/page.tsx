import type { Metadata } from "next";
import { ArrowUpRight, MapPin, MessageCircle, Phone } from "lucide-react";

import {
  CONTACT_PHONE,
  getContactPhoneHref,
  whatsappHref,
  WHATSAPP_GENERIC_MESSAGE,
} from "@/lib/contact/channels";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contactez Tourcoin pour préparer votre location de voiture au Maroc.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  const whatsapp = whatsappHref(WHATSAPP_GENERIC_MESSAGE);
  const phoneHref = getContactPhoneHref();

  return (
    <div className="bg-paper pb-24 pt-36 text-charcoal sm:pt-40">
      <div className="container-shell grid gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-24">
        <div>
          <p className="eyebrow">Parlons de votre trajet</p>
          <h1 className="display-tight mt-4 text-balance font-display text-5xl font-semibold sm:text-7xl">
            Une équipe locale, vraiment à votre écoute.
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-8 text-stone">
            Dites-nous où vous allez et ce dont vous avez besoin. Nous vous répondrons avec une proposition claire et adaptée.
          </p>
        </div>
        <div className="border-t border-black/10">
          <Contact href={whatsapp} icon={<MessageCircle />} title="WhatsApp" detail="Écrire à un conseiller" external />
          <Contact href={phoneHref} icon={<Phone />} title="Téléphone" detail={CONTACT_PHONE} />
          <div className="flex min-h-28 items-center gap-5 border-b border-black/10 py-5">
            <MapPin className="text-gold" />
            <div>
              <h2 className="font-display text-2xl font-semibold">Au Maroc</h2>
              <p className="mt-1 text-sm text-stone">Marrakech · Casablanca · Agadir · Tanger</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Contact({
  href,
  icon,
  title,
  detail,
  external = false,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  detail: string;
  external?: boolean;
}) {
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className="group flex min-h-28 items-center gap-5 border-b border-black/10 py-5 transition-colors hover:border-gold"
    >
      <span className="text-gold">{icon}</span>
      <div>
        <h2 className="font-display text-2xl font-semibold">{title}</h2>
        <p className="mt-1 text-sm text-stone">{detail}</p>
      </div>
      <ArrowUpRight className="ml-auto size-5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
    </a>
  );
}
