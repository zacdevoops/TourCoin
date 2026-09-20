import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-ink text-white">
      <div className="container-shell flex flex-col gap-10 py-12 md:flex-row md:items-end md:justify-between">
        <div>
          <Link href="/" className="text-lg font-extrabold">TOUR<span className="text-gold">COIN</span></Link>
          <p className="mt-3 max-w-md text-sm leading-6 text-white/55">Location de voitures au Maroc, avec une équipe locale pour confirmer chaque départ.</p>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/70" aria-label="Navigation de pied de page">
          <Link className="min-h-11 py-3 hover:text-white" href="/cars">La flotte</Link>
          <Link className="min-h-11 py-3 hover:text-white" href="/book">Réserver</Link>
          <Link className="min-h-11 py-3 hover:text-white" href="/contact">Contact</Link>
          <Link className="min-h-11 py-3 hover:text-white" href="/privacy">Confidentialité</Link>
        </nav>
      </div>
      <div className="border-t border-white/10 py-5 pb-20 text-center text-xs text-white/40 sm:pb-5">© {new Date().getFullYear()} Tourcoin. Tous droits réservés.</div>
    </footer>
  );
}
