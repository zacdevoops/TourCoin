import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { MobileNav } from "@/components/layout/mobile-nav";

const links = [
  ["La flotte", "/cars"],
  ["Notre service", "/#process"],
  ["Contact", "/contact"],
] as const;

export function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-ink/95 text-white backdrop-blur-xl">
      <div className="container-shell flex min-h-[4.5rem] items-center justify-between lg:min-h-20">
        <Link
          href="/"
          className="flex min-h-11 items-center text-base font-extrabold text-white"
          aria-label="Tourcoin, accueil"
        >
          TOUR<span className="text-gold">COIN</span>
        </Link>
        <nav className="hidden items-center gap-9 md:flex" aria-label="Navigation principale">
          {links.map(([label, href]) => (
            <Link
              key={href}
              href={href}
              className="flex min-h-11 items-center text-sm font-semibold text-ivory/75 transition-colors hover:text-ivory"
            >
              {label}
            </Link>
          ))}
          <Link
            href="/book"
            className="inline-flex min-h-11 items-center gap-2 rounded-sm bg-white px-5 text-sm font-extrabold text-charcoal transition-colors hover:bg-paper-muted"
          >
            Réserver <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </nav>
        <MobileNav />
      </div>
    </header>
  );
}
