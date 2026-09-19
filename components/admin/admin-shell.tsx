import { CalendarDays, CarFront, LayoutDashboard, LogOut } from "lucide-react";
import Link from "next/link";
import { signOutAdmin } from "@/lib/admin/actions";

const links = [
  { href: "/admin", label: "Vue d’ensemble", icon: LayoutDashboard },
  { href: "/admin/cars", label: "Véhicules", icon: CarFront },
  { href: "/admin/bookings", label: "Demandes", icon: CalendarDays },
];

export function AdminShell({
  email,
  children,
}: {
  email: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-ink text-ivory">
      <header className="sticky top-0 z-20 border-b border-line bg-ink/95 backdrop-blur">
        <div className="mx-auto flex max-w-[100rem] items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link href="/admin" className="min-h-11 content-center font-display text-lg font-semibold">
            Tourcoin <span className="text-gold">Admin</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden max-w-56 truncate text-sm text-muted md:block">{email}</span>
            <Link
              href="/admin/reset-password"
              className="hidden min-h-11 items-center text-sm font-medium text-muted hover:text-gold md:flex"
            >
              Mot de passe
            </Link>
            <form action={signOutAdmin}>
              <button
                aria-label="Se déconnecter"
                title="Se déconnecter"
                className="grid size-11 place-items-center rounded-lg border border-line hover:border-gold"
              >
                <LogOut className="size-4" aria-hidden="true" />
              </button>
            </form>
          </div>
        </div>
      </header>
      <div className="mx-auto flex max-w-[100rem] flex-col md:min-h-[calc(100vh-4.25rem)] md:flex-row">
        <nav
          aria-label="Administration"
          className="border-b border-line px-3 py-2 md:w-60 md:border-r md:border-b-0 md:px-4 md:py-6"
        >
          <ul className="flex gap-1 overflow-x-auto md:flex-col">
            {links.map(({ href, label, icon: Icon }) => (
              <li key={href} className="shrink-0">
                <Link
                  href={href}
                  className="flex min-h-11 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted hover:bg-surface-raised hover:text-ivory"
                >
                  <Icon className="size-4" aria-hidden="true" />
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-9">{children}</main>
      </div>
    </div>
  );
}
