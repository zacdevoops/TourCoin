import type { Metadata } from "next";
import Link from "next/link";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contactez Tourcoin pour préparer votre location de voiture au Maroc.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  const phone = process.env.NEXT_PUBLIC_CONTACT_PHONE;
  const email = process.env.NEXT_PUBLIC_CONTACT_EMAIL;
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  const normalizedPhone = phone?.replace(/[^\d+]/g, "");
  const normalizedWhatsapp = whatsapp?.replace(/\D/g, "");

  return (
    <div className="container-shell pb-24 pt-40">
      <div className="grid gap-16 lg:grid-cols-2">
        <div><p className="eyebrow">Parlons de votre trajet</p><h1 className="mt-4 text-balance font-display text-4xl font-semibold sm:text-6xl">Une équipe locale, à votre écoute.</h1><p className="mt-6 max-w-xl text-lg leading-8 text-muted">Dites-nous où vous allez et ce dont vous avez besoin. Nous vous répondrons avec une proposition claire et adaptée.</p></div>
        <div className="grid gap-4">
          {normalizedWhatsapp && <Contact href={`https://wa.me/${normalizedWhatsapp}`} icon={<MessageCircle />} title="WhatsApp" detail={whatsapp!} />}
          {normalizedPhone && <Contact href={`tel:${normalizedPhone}`} icon={<Phone />} title="Téléphone" detail={phone!} />}
          {email && <Contact href={`mailto:${email}`} icon={<Mail />} title="E-mail" detail={email} />}
          {!normalizedWhatsapp && !normalizedPhone && !email && (
            <Link href="/book" className="flex min-h-24 items-center gap-5 rounded-md border border-gold p-5 hover:bg-gold/10">
              <MessageCircle className="text-gold" />
              <div><h2 className="font-display text-lg font-semibold">Envoyer une demande</h2><p className="mt-1 text-sm text-muted">Notre équipe vous recontactera.</p></div>
            </Link>
          )}
          <div className="flex min-h-24 items-center gap-5 rounded-md border border-line p-5"><MapPin className="text-gold" /><div><h2 className="font-display text-lg font-semibold">Au Maroc</h2><p className="mt-1 text-sm text-muted">Marrakech · Casablanca · Agadir · Tanger</p></div></div>
        </div>
      </div>
    </div>
  );
}

function Contact({ href, icon, title, detail }: { href: string; icon: React.ReactNode; title: string; detail: string }) {
  return <a href={href} className="flex min-h-24 items-center gap-5 rounded-md border border-line p-5 hover:border-gold"><span className="text-gold">{icon}</span><div><h2 className="font-display text-lg font-semibold">{title}</h2><p className="mt-1 text-sm text-muted">{detail}</p></div></a>;
}
