import { notFound } from "next/navigation";
import { z } from "zod";
import { AccessError } from "@/components/admin/access-error";
import { CarForm } from "@/components/admin/car-form";
import { requireAdminPage } from "@/lib/admin/auth";
import { getCar } from "@/lib/admin/data";

export default async function EditCarPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const access = await requireAdminPage();
  if (access.status !== "authorized") return <AccessError message={access.message} />;
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const { car, error } = await getCar(access.supabase, id);
  if (!car && !error) notFound();

  if (error || !car) {
    return <AccessError title="Véhicule indisponible" message={error ?? "Ce véhicule est introuvable."} />;
  }

  return (
    <div className="mx-auto max-w-6xl">
      <p className="eyebrow">Catalogue</p>
      <h1 className="mt-2 font-display text-3xl font-semibold">Modifier {car.name}</h1>
      <p className="mt-2 mb-7 text-muted">Le prix et la visibilité sont placés en premier pour les mises à jour rapides.</p>
      <CarForm car={car} />
    </div>
  );
}
