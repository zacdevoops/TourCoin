import Link from "next/link";
import { Menu } from "lucide-react";

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
          <Link href="/cars" className="inline-flex min-h-11 items-center rounded-sm bg-gold px-5 text-sm font-bold text-ink hover:bg-gold-strong">
            Réserver
          </Link>
        </nav>
        <details className="group relative md:hidden">
          <summary className="flex size-11 cursor-pointer list-none items-center justify-center rounded-sm border border-line" aria-label="Ouvrir le menu">
            <Menu aria-hidden="true" />
          </summary>
          <nav className="absolute right-0 mt-3 grid w-60 rounded-md border border-line bg-surface p-3 shadow-premium" aria-label="Navigation mobile">
            {links.map(([label, href]) => (
              <Link key={href} href={href} className="flex min-h-11 items-center rounded-sm px-3 text-sm hover:bg-white/5">
                {label}
              </Link>
            ))}
          </nav>
        </details>
      </div>
    </header>
  );
}
