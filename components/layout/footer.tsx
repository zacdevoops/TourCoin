import Link from "next/link";

import { ContactChoices } from "@/components/contact/contact-choices";

export function Footer() {
  return (
    <footer className="border-t border-line bg-surface">
      <div className="container-shell grid gap-10 py-14 md:grid-cols-3">
        <div>
          <Link href="/" className="font-display text-xl font-semibold">TOUR<span className="text-gold">COIN</span></Link>
          <p className="mt-4 max-w-xs text-sm leading-6 text-muted">Location automobile au Maroc, avec un service humain avant, pendant et après votre trajet.</p>
        </div>
        <div>
          <p className="eyebrow mb-4">Explorer</p>
          <div className="grid gap-2 text-sm">
            <Link className="min-h-11 py-3 hover:text-gold" href="/cars">Nos voitures</Link>
            <Link className="min-h-11 py-3 hover:text-gold" href="/book">Réserver</Link>
            <Link className="min-h-11 py-3 hover:text-gold" href="/contact">Contact</Link>
            <Link className="min-h-11 py-3 hover:text-gold" href="/privacy">Confidentialité</Link>
          </div>
        </div>
        <div>
          <p className="eyebrow mb-4">Nous joindre</p>
          <p className="text-sm leading-7 text-muted">Une équipe basée au Maroc.</p>
          <ContactChoices className="mt-4" />
        </div>
      </div>
      <div className="border-t border-line py-5 pb-24 text-center text-xs text-muted">© {new Date().getFullYear()} Tourcoin. Tous droits réservés.</div>
    </footer>
  );
}
