import { AccessError } from "@/components/admin/access-error";
import { CarForm } from "@/components/admin/car-form";
import { requireAdminPage } from "@/lib/admin/auth";

export default async function NewCarPage() {
  const access = await requireAdminPage();
  if (access.status !== "authorized") return <AccessError message={access.message} />;

  return (
    <div className="mx-auto max-w-6xl">
      <p className="eyebrow">Catalogue</p>
      <h1 className="mt-2 font-display text-3xl font-semibold">Ajouter un véhicule</h1>
      <p className="mt-2 mb-7 text-muted">Tous les champs sont requis.</p>
      <CarForm />
    </div>
  );
}
