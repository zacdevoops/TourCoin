import { ArrowRight, CarFront, CircleCheck, CircleOff, Star } from "lucide-react";
import Link from "next/link";
import { AccessError } from "@/components/admin/access-error";
import { BookingList } from "@/components/admin/booking-list";
import { getDashboardData } from "@/lib/admin/data";
import { requireAdminPage } from "@/lib/admin/auth";

export default async function AdminDashboardPage() {
  const access = await requireAdminPage();
  if (access.status !== "authorized") return <AccessError message={access.message} />;
  const data = await getDashboardData(access.supabase);

  const cards = [
    { label: "Total", value: data.counts.total, icon: CarFront },
    { label: "Visibles", value: data.counts.active, icon: CircleCheck },
    { label: "Masqués", value: data.counts.inactive, icon: CircleOff },
    { label: "En avant", value: data.counts.featured, icon: Star },
  ];

  return (
    <div>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow">Vue d’ensemble</p>
          <h1 className="mt-2 font-display text-3xl font-semibold">Bonjour</h1>
          <p className="mt-2 text-muted">L’essentiel de votre activité, sans données artificielles.</p>
        </div>
        <Link href="/admin/cars/new" className="min-h-12 rounded-lg bg-gold px-5 py-3 text-center font-semibold text-ink hover:bg-gold-strong">
          Ajouter un véhicule
        </Link>
      </div>

      {data.error && <p role="alert" className="mt-6 rounded-lg border border-danger/40 bg-danger/10 p-3 text-sm">{data.error}</p>}

      <section aria-label="Véhicules" className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cards.map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-xl border border-line bg-surface-raised p-4 sm:p-5">
            <Icon className="size-5 text-gold" aria-hidden="true" />
            <p className="mt-4 text-3xl font-semibold">{value}</p>
            <p className="mt-1 text-sm text-muted">{label}</p>
          </div>
        ))}
      </section>

      <section className="mt-10">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-xl font-semibold">Demandes récentes</h2>
            <p className="mt-1 text-sm text-muted">Les six dernières demandes reçues.</p>
          </div>
          <Link href="/admin/bookings" className="flex min-h-11 items-center gap-2 text-sm font-semibold text-gold">
            Tout voir <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
        <BookingList bookings={data.recentBookings} compact />
      </section>
    </div>
  );
}
