import { Pencil, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { deleteCar, toggleCar } from "@/lib/admin/actions";
import { carPublicLabel, type Car } from "@/types/domain";
import { MutationForm } from "./mutation-form";

const money = new Intl.NumberFormat("fr-MA");

export function CarList({ cars }: { cars: Car[] }) {
  if (cars.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-line p-10 text-center">
        <p className="text-lg font-semibold">Aucun véhicule</p>
        <p className="mt-2 text-muted">Ajoutez votre premier véhicule au catalogue.</p>
        <Link
          href="/admin/cars/new"
          className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-lg bg-gold px-5 py-3 font-semibold text-ink"
        >
          <Plus className="size-4" aria-hidden="true" /> Ajouter
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="hidden overflow-x-auto rounded-xl border border-line lg:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-raised text-xs uppercase tracking-wider text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Véhicule</th>
              <th className="px-4 py-3 font-medium">Catégorie</th>
              <th className="px-4 py-3 font-medium">Année</th>
              <th className="px-4 py-3 font-medium">Prix / jour</th>
              <th className="px-4 py-3 font-medium">Visible</th>
              <th className="px-4 py-3 font-medium">En avant</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {cars.map((car) => (
              <tr key={car.id} className="bg-surface hover:bg-surface-raised">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Image
                      src={car.imageUrl}
                      alt=""
                      width={72}
                      height={52}
                      unoptimized
                      className="h-13 w-18 rounded-md object-cover"
                    />
                    <div>
                      <p className="font-semibold">{car.name}</p>
                      <p className="text-xs text-muted">{car.brand} {car.model}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">{carPublicLabel(car)}</td>
                <td className="px-4 py-3">{car.year}</td>
                <td className="px-4 py-3 font-semibold">{car.pricePerDay > 0 ? `${money.format(car.pricePerDay)} MAD` : "À renseigner"}</td>
                <td className="px-4 py-3"><Toggle car={car} field="active" /></td>
                <td className="px-4 py-3"><Toggle car={car} field="featured" /></td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <Link
                      href={`/admin/cars/${car.id}/edit`}
                      className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-line px-3 hover:border-gold"
                    >
                      <Pencil className="size-4" aria-hidden="true" /> Modifier
                    </Link>
                    <DeleteControl car={car} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-4 lg:hidden">
        {cars.map((car) => (
          <article key={car.id} className="overflow-hidden rounded-xl border border-line bg-surface">
            <div className="grid grid-cols-[7rem_1fr] gap-4 p-4">
              <Image src={car.imageUrl} alt="" width={112} height={84} unoptimized className="h-21 w-28 rounded-lg object-cover" />
              <div className="min-w-0">
                <h2 className="truncate font-semibold">{car.name}</h2>
                <p className="mt-1 text-sm text-muted">{carPublicLabel(car)} · {car.year}</p>
                <p className="mt-2 font-semibold text-gold">{car.pricePerDay > 0 ? `${money.format(car.pricePerDay)} MAD / jour` : "Prix à renseigner"}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 border-t border-line p-4">
              <Toggle car={car} field="active" />
              <Toggle car={car} field="featured" />
            </div>
            <div className="flex flex-wrap gap-2 border-t border-line p-4">
              <Link href={`/admin/cars/${car.id}/edit`} className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg border border-line px-3">
                <Pencil className="size-4" aria-hidden="true" /> Modifier
              </Link>
              <DeleteControl car={car} />
            </div>
          </article>
        ))}
      </div>
    </>
  );
}

function Toggle({ car, field }: { car: Car; field: "active" | "featured" }) {
  const current = car[field];
  const label =
    field === "active"
      ? current ? "Visible" : "Masqué"
      : current ? "En avant" : "Standard";
  return (
    <MutationForm
      action={toggleCar}
      label={label}
      pendingLabel="…"
      buttonClassName={`min-h-11! w-full whitespace-nowrap border! px-3! py-2! text-sm ${
        current
          ? "border-gold/50! bg-gold/10! text-gold!"
          : "border-line! bg-transparent! text-muted!"
      }`}
    >
      <input type="hidden" name="id" value={car.id} />
      <input type="hidden" name="field" value={field} />
      <input type="hidden" name="value" value={String(!current)} />
    </MutationForm>
  );
}

function DeleteControl({ car }: { car: Car }) {
  return (
    <details className="relative flex-1 lg:flex-none">
      <summary className="min-h-11 cursor-pointer list-none content-center rounded-lg border border-danger/40 px-3 text-center text-danger hover:bg-danger/10">
        Supprimer
      </summary>
      <div className="absolute right-0 z-10 mt-2 w-72 rounded-lg border border-danger/50 bg-surface-raised p-4 shadow-premium">
        <p className="font-semibold">Supprimer définitivement ?</p>
        <p className="mt-2 text-sm text-muted">
          Le véhicule disparaîtra du catalogue. Les anciennes demandes garderont leur copie du véhicule.
        </p>
        <MutationForm
          action={deleteCar}
          label="Confirmer la suppression"
          pendingLabel="Suppression…"
          confirmMessage={`Supprimer définitivement « ${car.name} » ?`}
          className="mt-4"
          buttonClassName="w-full bg-danger! text-white! hover:opacity-90"
        >
          <input type="hidden" name="id" value={car.id} />
        </MutationForm>
      </div>
    </details>
  );
}
