import { Plus } from "lucide-react";
import Link from "next/link";
import { AccessError } from "@/components/admin/access-error";
import { CarList } from "@/components/admin/car-list";
import { requireAdminPage } from "@/lib/admin/auth";
import { getCars } from "@/lib/admin/data";

export default async function AdminCarsPage() {
  const access = await requireAdminPage();
  if (access.status !== "authorized") return <AccessError message={access.message} />;
  const { cars, error } = await getCars(access.supabase);

  return (
    <div>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow">Catalogue</p>
          <h1 className="mt-2 font-display text-3xl font-semibold">Véhicules</h1>
          <p className="mt-2 text-muted">{cars.length} véhicule{cars.length === 1 ? "" : "s"} enregistré{cars.length === 1 ? "" : "s"}.</p>
        </div>
        <Link href="/admin/cars/new" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-gold px-5 py-3 font-semibold text-ink">
          <Plus className="size-4" aria-hidden="true" /> Ajouter un véhicule
        </Link>
      </div>
      {error && <p role="alert" className="mt-6 rounded-lg border border-danger/40 bg-danger/10 p-3">{error}</p>}
      <div className="mt-7"><CarList cars={cars} /></div>
    </div>
  );
}
