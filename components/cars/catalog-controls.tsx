import Link from "next/link";

import { catalogSearchHref, type CatalogSearchValues } from "@/lib/catalog/params";
import {
  CATALOG_FILTERS,
  FUEL_TYPES,
  TRANSMISSIONS,
} from "@/types/domain";

export function CatalogControls({ values }: { values: CatalogSearchValues }) {
  const allSelected = !values.category && !values.segment;

  return (
    <div className="space-y-5">
      <nav aria-label="Catégories" className="flex flex-wrap gap-2">
        <CategoryChip href={catalogSearchHref({ ...values, category: undefined, segment: undefined })} current={allSelected}>
          Toutes
        </CategoryChip>
        {CATALOG_FILTERS.map((filter) => (
          <CategoryChip
            key={filter.id}
            href={catalogSearchHref({
              ...values,
              category: filter.category,
              segment: filter.segment,
            })}
            current={
              filter.segment
                ? values.segment === filter.segment
                : values.category === filter.category && !values.segment
            }
          >
            {filter.label}
          </CategoryChip>
        ))}
      </nav>

      <form method="get" className="grid gap-3 rounded-lg border border-line bg-surface p-4 md:grid-cols-4">
        {values.location ? <input type="hidden" name="location" value={values.location} /> : null}
        {values.pickup ? <input type="hidden" name="pickup" value={values.pickup} /> : null}
        {values.return ? <input type="hidden" name="return" value={values.return} /> : null}
        {values.category ? <input type="hidden" name="category" value={values.category} /> : null}
        {values.segment ? <input type="hidden" name="segment" value={values.segment} /> : null}
        <label className="sr-only" htmlFor="q">
          Rechercher
        </label>
        <input
          id="q"
          name="q"
          defaultValue={values.q}
          placeholder="Marque ou modèle"
          className="field"
        />
        <Select
          name="fuel"
          label="Tous carburants"
          values={FUEL_TYPES}
          selected={values.fuel}
        />
        <Select
          name="transmission"
          label="Toute transmission"
          values={TRANSMISSIONS}
          selected={values.transmission}
        />
        <div className="flex gap-2">
          <select
            name="sort"
            defaultValue={values.sort ?? "recommended"}
            className="field"
            aria-label="Trier les voitures"
          >
            <option value="recommended">Recommandées</option>
            <option value="price-asc">Prix croissant</option>
            <option value="price-desc">Prix décroissant</option>
            <option value="newest">Plus récentes</option>
          </select>
          <button className="min-h-12 shrink-0 rounded-sm bg-gold px-5 font-bold text-ink hover:bg-gold-strong">
            Filtrer
          </button>
        </div>
      </form>
    </div>
  );
}

function CategoryChip({
  href,
  current,
  children,
}: {
  href: string;
  current: boolean;
  children: string;
}) {
  return (
    <Link
      href={href}
      aria-current={current ? "page" : undefined}
      className={`inline-flex min-h-11 items-center rounded-sm border px-4 text-sm font-semibold ${
        current
          ? "border-gold bg-gold text-ink"
          : "border-line text-ivory hover:border-gold"
      }`}
    >
      {children}
    </Link>
  );
}

function Select({
  name,
  label,
  values,
  selected,
}: {
  name: string;
  label: string;
  values: readonly string[];
  selected?: string;
}) {
  return (
    <select name={name} defaultValue={selected ?? ""} className="field" aria-label={label}>
      <option value="">{label}</option>
      {values.map((value) => (
        <option value={value} key={value}>
          {value[0].toUpperCase() + value.slice(1)}
        </option>
      ))}
    </select>
  );
}
