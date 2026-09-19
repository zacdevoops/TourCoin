"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import {
  CAR_CATEGORIES,
  CAR_CATEGORY_LABELS,
  CAR_SEGMENTS,
  isProductCategory,
  PRODUCT_CATEGORIES,
  type Car,
} from "@/types/domain";
import { createCar, updateCar } from "@/lib/admin/actions";
import { INITIAL_ACTION_STATE } from "@/lib/admin/action-state";
import { SubmitButton } from "./submit-button";

const inputClass = "field";
const labelClass = "mb-2 block text-sm font-medium";

export function CarForm({ car }: { car?: Car }) {
  const [state, action] = useActionState(car ? updateCar : createCar, INITIAL_ACTION_STATE);
  const [preview, setPreview] = useState(car?.imageUrl ?? "");
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  useEffect(() => () => {
    if (objectUrl) URL.revokeObjectURL(objectUrl);
  }, [objectUrl]);

  function onImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    if (!file) {
      setObjectUrl(null);
      setPreview(car?.imageUrl ?? "");
      return;
    }
    const nextUrl = URL.createObjectURL(file);
    setObjectUrl(nextUrl);
    setPreview(nextUrl);
  }

  const error = (name: string) => state.fieldErrors?.[name]?.[0];

  return (
    <form action={action} className="space-y-8">
      {car && <input type="hidden" name="id" value={car.id} />}
      {state.status === "error" && (
        <div role="alert" className="rounded-lg border border-danger/50 bg-danger/10 p-4">
          <p className="font-medium">Enregistrement impossible</p>
          <p className="mt-1 text-sm text-muted">{state.message}</p>
        </div>
      )}

      <section className="rounded-xl border border-line bg-surface-raised p-4 sm:p-6">
        <h2 className="font-display text-lg font-semibold">Prix et disponibilité</h2>
        <p className="mt-1 text-sm text-muted">Les réglages les plus souvent modifiés.</p>
        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Prix / jour (MAD)" name="pricePerDay" error={error("pricePerDay")}>
            <input
              className={`${inputClass} text-lg font-semibold`}
              id="pricePerDay"
              name="pricePerDay"
              type="number"
              min="1"
              max="100000"
              defaultValue={car?.pricePerDay ? car.pricePerDay : ""}
              inputMode="numeric"
            />
          </Field>
          <Field label="Ordre d’affichage" name="sortOrder" error={error("sortOrder")}>
            <input
              className={inputClass}
              id="sortOrder"
              name="sortOrder"
              type="number"
              defaultValue={car?.sortOrder ?? 0}
              required
            />
          </Field>
          <Toggle name="active" label="Visible sur le site" defaultChecked={car?.active ?? false} />
          <Toggle name="featured" label="Mettre en avant" defaultChecked={car?.featured ?? false} />
        </div>
      </section>

      <section className="rounded-xl border border-line bg-surface-raised p-4 sm:p-6">
        <h2 className="font-display text-lg font-semibold">Identité du véhicule</h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Nom affiché" name="name" error={error("name")}>
            <input className={inputClass} id="name" name="name" defaultValue={car?.name} required />
          </Field>
          <Field label="Marque" name="brand" error={error("brand")}>
            <input className={inputClass} id="brand" name="brand" defaultValue={car?.brand} required />
          </Field>
          <Field label="Modèle" name="model" error={error("model")}>
            <input className={inputClass} id="model" name="model" defaultValue={car?.model} required />
          </Field>
          <Field label="Slug URL" name="slug" error={error("slug")}>
            <input
              className={inputClass}
              id="slug"
              name="slug"
              defaultValue={car?.slug}
              pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
              placeholder="dacia-duster"
              required
            />
          </Field>
          <Field label="Année" name="year" error={error("year")}>
            <input
              className={inputClass}
              id="year"
              name="year"
              type="number"
              min="1990"
              max="2026"
              defaultValue={car?.year ?? new Date().getFullYear()}
              required
            />
          </Field>
          <Field label="Catégorie" name="category" error={error("category")}>
            <select className={inputClass} id="category" name="category" defaultValue={car?.category ?? "suv"}>
              {(car && !isProductCategory(car.category) ? CAR_CATEGORIES : PRODUCT_CATEGORIES).map((category) => (
                <option value={category} key={category}>
                  {CAR_CATEGORY_LABELS[category]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Segment" name="segment" error={error("segment")}>
            <select className={inputClass} id="segment" name="segment" defaultValue={car?.segment ?? ""}>
              <option value="">Aucun</option>
              {CAR_SEGMENTS.map((segment) => (
                <option value={segment} key={segment}>
                  {segment === "suv_urbain"
                    ? "SUV urbains / petits SUV"
                    : segment === "suv_standard"
                      ? "SUV / Crossovers"
                      : "Segment C"}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </section>

      <section className="rounded-xl border border-line bg-surface-raised p-4 sm:p-6">
        <h2 className="font-display text-lg font-semibold">Caractéristiques</h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Carburant" name="fuel" error={error("fuel")}>
            <select className={inputClass} id="fuel" name="fuel" defaultValue={car?.fuel ?? "diesel"}>
              <option value="essence">Essence</option>
              <option value="diesel">Diesel</option>
              <option value="hybride">Hybride</option>
            </select>
          </Field>
          <Field label="Transmission" name="transmission" error={error("transmission")}>
            <select
              className={inputClass}
              id="transmission"
              name="transmission"
              defaultValue={car?.transmission ?? "manuelle"}
            >
              <option value="manuelle">Manuelle</option>
              <option value="automatique">Automatique</option>
            </select>
          </Field>
          <Field label="Places" name="seats" error={error("seats")}>
            <input className={inputClass} id="seats" name="seats" type="number" min="1" max="12" defaultValue={car?.seats ?? 5} required />
          </Field>
          <Field label="Portes" name="doors" error={error("doors")}>
            <input className={inputClass} id="doors" name="doors" type="number" min="2" max="6" defaultValue={car?.doors ?? 5} required />
          </Field>
        </div>
        <div className="mt-5">
          <Field label="Description" name="description" error={error("description")}>
            <textarea
              className={`${inputClass} min-h-36 resize-y`}
              id="description"
              name="description"
              minLength={20}
              maxLength={3000}
              defaultValue={car?.description}
              required
            />
          </Field>
        </div>
      </section>

      <section className="rounded-xl border border-line bg-surface-raised p-4 sm:p-6">
        <h2 className="font-display text-lg font-semibold">Photo</h2>
        <div className="mt-5 grid gap-5 md:grid-cols-[16rem_1fr]">
          <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-line bg-surface">
            {preview ? (
              <Image src={preview} alt="Aperçu du véhicule" fill unoptimized className="object-cover" />
            ) : (
              <div className="grid h-full place-items-center px-4 text-center text-sm text-muted">Aucun aperçu</div>
            )}
          </div>
          <Field label={car ? "Remplacer la photo (facultatif)" : "Photo du véhicule"} name="image" error={error("image")}>
            <input
              className={`${inputClass} file:mr-3 file:rounded-md file:border-0 file:bg-gold file:px-3 file:py-2 file:font-medium file:text-ink`}
              id="image"
              name="image"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              required={!car}
              onChange={onImageChange}
            />
            <p className="mt-2 text-sm text-muted">JPG, PNG ou WebP, 5 Mo maximum.</p>
          </Field>
        </div>
      </section>

      <div className="sticky bottom-3 z-10 flex flex-col-reverse gap-3 rounded-xl border border-line bg-ink/95 p-3 shadow-premium backdrop-blur sm:flex-row sm:justify-end">
        <Link href="/admin/cars" className="min-h-12 rounded-lg border border-line px-5 py-3 text-center font-semibold hover:border-gold">
          Annuler
        </Link>
        <SubmitButton pendingLabel="Enregistrement…">
          {car ? "Enregistrer les modifications" : "Ajouter le véhicule"}
        </SubmitButton>
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  error,
  children,
}: {
  label: string;
  name: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={name} className={labelClass}>{label}</label>
      {children}
      {error && <p className="mt-1 text-sm text-danger">{error}</p>}
    </div>
  );
}

function Toggle({
  name,
  label,
  defaultChecked,
}: {
  name: string;
  label: string;
  defaultChecked: boolean;
}) {
  return (
    <label className="flex min-h-12 cursor-pointer items-center gap-3 rounded-lg border border-line px-4">
      <input name={name} type="checkbox" defaultChecked={defaultChecked} className="size-5 accent-gold" />
      <span className="text-sm font-medium">{label}</span>
    </label>
  );
}
