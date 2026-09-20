import Link from "next/link";
import { Search, SlidersHorizontal } from "lucide-react";

import { catalogSearchHref, type CatalogSearchValues } from "@/lib/catalog/params";
import {
  CATALOG_FILTERS,
  FUEL_TYPES,
  TRANSMISSIONS,
} from "@/types/domain";

const inputClass =
  "min-h-12 w-full rounded-sm border border-black/15 bg-white px-3 text-sm text-charcoal outline-none focus:border-charcoal";

export function CatalogControls({ values }: { values: CatalogSearchValues }) {
  const allSelected = !values.category && !values.segment;

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <p className="text-sm font-extrabold text-charcoal">Affiner la sélection</p>
        <nav aria-label="Catégories" className="flex flex-wrap gap-x-5 gap-y-1 border-b border-black/10">
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
      </div>

      <form method="get" className="grid gap-3 lg:grid-cols-4">
        {values.location ? <input type="hidden" name="location" value={values.location} /> : null}
        {values.pickup ? <input type="hidden" name="pickup" value={values.pickup} /> : null}
        {values.return ? <input type="hidden" name="return" value={values.return} /> : null}
        {values.category ? <input type="hidden" name="category" value={values.category} /> : null}
        {values.segment ? <input type="hidden" name="segment" value={values.segment} /> : null}
        <label className="sr-only" htmlFor="q">Rechercher</label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-stone" aria-hidden="true" />
          <input id="q" name="q" defaultValue={values.q} placeholder="Marque ou modèle" className={`${inputClass} pl-10`} />
        </div>
        <Select name="fuel" label="Tous carburants" values={FUEL_TYPES} selected={values.fuel} />
        <Select name="transmission" label="Toute transmission" values={TRANSMISSIONS} selected={values.transmission} />
        <div className="flex gap-2">
          <select name="sort" defaultValue={values.sort ?? "recommended"} className={inputClass} aria-label="Trier les voitures">
            <option value="recommended">Recommandées</option>
            <option value="price-asc">Prix croissant</option>
            <option value="price-desc">Prix décroissant</option>
            <option value="newest">Plus récentes</option>
          </select>
          <button aria-label="Appliquer les filtres" className="inline-flex size-12 shrink-0 items-center justify-center rounded-sm bg-charcoal text-white hover:bg-black xl:w-auto xl:px-5">
            <SlidersHorizontal className="size-4 xl:hidden" aria-hidden="true" />
            <span className="hidden font-extrabold xl:inline">Filtrer</span>
          </button>
        </div>
      </form>
    </div>
  );
}

function CategoryChip({ href, current, children }: { href: string; current: boolean; children: string }) {
  return (
    <Link href={href} aria-current={current ? "page" : undefined} className={`inline-flex min-h-10 items-center border-b-2 px-0 text-xs font-extrabold transition-colors ${current ? "border-charcoal text-charcoal" : "border-transparent text-stone hover:text-charcoal"}`}>
      {children}
    </Link>
  );
}

function Select({ name, label, values, selected }: { name: string; label: string; values: readonly string[]; selected?: string }) {
  return (
    <select name={name} defaultValue={selected ?? ""} className={inputClass} aria-label={label}>
      <option value="">{label}</option>
      {values.map((value) => (
        <option value={value} key={value}>
          {value[0].toUpperCase() + value.slice(1)}
        </option>
      ))}
    </select>
  );
}
