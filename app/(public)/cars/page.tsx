import type { Metadata } from "next";
import Link from "next/link";
import { CarFront } from "lucide-react";

import { CarCard } from "@/components/cars/car-card";
import { CatalogControls } from "@/components/cars/catalog-controls";
import { ContactChoices } from "@/components/contact/contact-choices";
import { HomeSearch } from "@/components/home/home-search";
import { PICKUP_LOCATIONS } from "@/lib/booking/constants";
import { casablancaCalendarDate } from "@/lib/booking/datetime";
import { catalogSearchHref, sanitizeCatalogValues } from "@/lib/catalog/params";
import { getCatalog } from "@/lib/fleet/queries";

export const metadata: Metadata = {
  title: "Nos voitures",
  description: "Découvrez les voitures disponibles à la location au Maroc.",
  alternates: { canonical: "/cars" },
};

type Params = Promise<Record<string, string | string[] | undefined>>;

export default async function CarsPage({ searchParams }: { searchParams: Params }) {
  const raw = await searchParams;
  const value = (key: string) => typeof raw[key] === "string" ? raw[key] : undefined;
  const values = sanitizeCatalogValues({
    q: value("q"),
    category: value("category"),
    segment: value("segment"),
    fuel: value("fuel"),
    transmission: value("transmission"),
    sort: value("sort"),
    location: value("location"),
    pickup: value("pickup"),
    return: value("return"),
  });
  const today = casablancaCalendarDate();
  const hasDeparture = Boolean(values.location && values.pickup);
  const pickupIsCurrent = Boolean(values.pickup && values.pickup >= today);
  const returnIsValid = Boolean(
    !values.return || (values.pickup && values.return > values.pickup),
  );
  const canShowResults = hasDeparture && pickupIsCurrent && returnIsValid;
  const page = Math.max(1, Number.parseInt(value("page") ?? "1", 10) || 1);
  const { cars: visible, count, unavailable } = canShowResults
    ? await getCatalog({
        q: values.q,
        category: values.category,
        segment: values.segment,
        fuel: values.fuel,
        transmission: values.transmission,
        sort: values.sort,
        page,
      })
    : { cars: [], count: 0, unavailable: false };
  const totalPages = Math.max(1, Math.ceil(count / 9));
  const currentPage = Math.min(page, totalPages);
  const tripLocation = PICKUP_LOCATIONS.find((location) => location.slug === values.location)?.label;
  const hasFilters = Boolean(values.q || values.category || values.segment || values.fuel || values.transmission);

  return (
    <div className="min-h-screen bg-paper pb-24 pt-32 text-charcoal sm:pt-36">
      <div className="container-shell">
        <header className="grid gap-5 border-b border-black/10 pb-10 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <p className="eyebrow">La flotte Tourcoin</p>
            <h1 className="mt-3 font-display text-5xl font-semibold leading-none sm:text-6xl">Nos voitures</h1>
            <p className="mt-4 max-w-2xl leading-7 text-stone">Comparez les formats, les équipements essentiels et le tarif journalier en un regard.</p>
          </div>
          {canShowResults ? (
            <p className="text-sm text-stone"><strong className="text-2xl text-charcoal">{count}</strong> véhicule{count === 1 ? "" : "s"}</p>
          ) : null}
        </header>

        {!canShowResults ? (
          <section className="py-10 sm:py-14" aria-labelledby="availability-gate-title">
            <div className="mx-auto mb-8 max-w-2xl text-center">
              <CarFront className="mx-auto size-8 text-stone" aria-hidden="true" />
              <h2 id="availability-gate-title" className="mt-4 font-display text-3xl font-semibold sm:text-4xl">
                Choisissez votre départ et votre date pour voir les véhicules disponibles.
              </h2>
              {!returnIsValid ? (
                <p className="mt-3 text-sm font-semibold text-danger">La date de retour doit être après la date de départ.</p>
              ) : null}
              {!pickupIsCurrent && values.pickup ? (
                <p className="mt-3 text-sm font-semibold text-danger">La date de départ ne peut pas être dans le passé.</p>
              ) : null}
            </div>
            <HomeSearch
              today={today}
              heading="Votre recherche"
              caption="Le retour doit être après le départ"
              initialValues={{
                location: values.location,
                pickup: values.pickup,
                return: values.return,
              }}
            />
          </section>
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/10 py-5 text-sm">
              <p className="font-semibold text-charcoal">
                {tripLocation} · {formatFrDate(values.pickup!)}{values.return ? ` → ${formatFrDate(values.return)}` : ""}
              </p>
              <Link href="/cars" className="font-extrabold text-stone underline underline-offset-4">Modifier le départ</Link>
            </div>

            <section className="border-b border-black/10 py-7" aria-label="Filtres du catalogue">
              <CatalogControls values={values} />
            </section>

            {!unavailable ? (
              <div className="flex flex-col justify-between gap-3 py-7 text-sm text-stone sm:flex-row sm:items-center">
                <p>{hasFilters ? `${count} résultat${count === 1 ? "" : "s"} pour votre recherche` : "Tous les véhicules actuellement proposés"}</p>
                {hasFilters ? <Link href={catalogSearchHref({ location: values.location, pickup: values.pickup, return: values.return })} className="font-extrabold text-charcoal underline underline-offset-4">Effacer les filtres</Link> : null}
              </div>
            ) : null}

            {unavailable ? (
              <div className="border border-black/10 bg-white p-8 text-stone">
                <p>Le catalogue est momentanément indisponible. Notre équipe reste joignable.</p>
                <ContactChoices className="mt-5" />
              </div>
            ) : visible.length ? (
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {visible.map((car, index) => <CarCard key={car.id} car={car} priority={index === 0} />)}
              </div>
            ) : (
              <div className="border-y border-black/10 py-20 text-center">
                <CarFront className="mx-auto size-9 text-stone" aria-hidden="true" />
                <h2 className="mt-4 font-display text-3xl font-semibold">Aucun véhicule pour ces critères</h2>
                <p className="mx-auto mt-3 max-w-lg text-stone">Modifiez votre sélection pour afficher d’autres véhicules.</p>
              </div>
            )}

            {totalPages > 1 ? (
              <nav className="mt-12 flex justify-center gap-2" aria-label="Pagination">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                  <Link key={number} href={catalogSearchHref(values, number)} aria-current={number === currentPage ? "page" : undefined} className={`flex size-11 items-center justify-center border text-sm font-bold ${number === currentPage ? "border-charcoal bg-charcoal text-white" : "border-black/15 bg-white"}`}>{number}</Link>
                ))}
              </nav>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}

function formatFrDate(iso: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${iso}T12:00:00`));
}
