import Link from "next/link";

import { MobileNav } from "@/components/layout/mobile-nav";

const links = [
  ["Accueil", "/"],
  ["Nos voitures", "/cars"],
  ["Contact", "/contact"],
] as const;

export function Header() {
  return (
    <header className="absolute inset-x-0 top-0 z-30 border-b border-white/10 bg-ink/55 backdrop-blur-md">
      <div className="container-shell flex min-h-20 items-center justify-between">
        <Link href="/" className="flex min-h-11 items-center font-display text-xl font-semibold tracking-tight" aria-label="Tourcoin, accueil">
          TOUR<span className="text-gold">COIN</span>
        </Link>
        <nav className="hidden items-center gap-8 md:flex" aria-label="Navigation principale">
          {links.map(([label, href]) => (
            <Link key={href} href={href} className="flex min-h-11 items-center text-sm font-medium text-ivory/80 hover:text-gold">
              {label}
            </Link>
          ))}
          <Link href="/book" className="inline-flex min-h-11 items-center rounded-sm bg-gold px-5 text-sm font-bold text-ink hover:bg-gold-strong">
            Réserver
          </Link>
        </nav>
        <MobileNav />
      </div>
    </header>
  );
}
