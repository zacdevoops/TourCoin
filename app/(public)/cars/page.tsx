import type { Metadata } from "next";
import Link from "next/link";
import { CarCard } from "@/components/cars/car-card";
import { CatalogControls } from "@/components/cars/catalog-controls";
import { ContactChoices } from "@/components/contact/contact-choices";
import { PICKUP_LOCATIONS } from "@/lib/booking/constants";
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
  const page = Math.max(1, Number.parseInt(value("page") ?? "1", 10) || 1);
  const { cars: visible, count, unavailable } = await getCatalog({
    q: values.q,
    category: values.category,
    segment: values.segment,
    fuel: values.fuel,
    transmission: values.transmission,
    sort: values.sort,
    page,
  });
  const totalPages = Math.max(1, Math.ceil(count / 9));
  const currentPage = Math.min(page, totalPages);
  const tripLocation = PICKUP_LOCATIONS.find((location) => location.slug === values.location)?.label;
  const tripComplete = Boolean(tripLocation && values.pickup && values.return);

  return (
    <div className="container-shell pb-24 pt-36">
      <p className="eyebrow">Flotte Tourcoin</p>
      <h1 className="mt-4 font-display text-4xl font-semibold sm:text-6xl">Trouvez votre voiture</h1>
      <p className="mt-5 max-w-2xl text-muted">Des citadines économiques aux compactes, SUV et berlines, choisissez le véhicule adapté à votre route.</p>
      {tripComplete ? (
        <p className="mt-4 text-sm text-ivory/80">
          Trajet : {tripLocation} · {formatFrDate(values.pickup!)} → {formatFrDate(values.return!)}
        </p>
      ) : null}
      <div className="mt-10"><CatalogControls values={values} /></div>
      {unavailable ? (
        <div className="mt-10 rounded-md border border-line bg-surface p-8 text-muted">
          <p>Le catalogue est momentanément indisponible. Notre équipe reste joignable.</p>
          <ContactChoices className="mt-5" />
        </div>
      ) : visible.length ? (
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {visible.map((car, index) => <CarCard key={car.id} car={car} priority={index === 0} />)}
        </div>
      ) : (
        <div className="mt-10 rounded-md border border-line p-10 text-center text-muted">Aucune voiture ne correspond à ces critères.</div>
      )}
      {totalPages > 1 && <nav className="mt-10 flex justify-center gap-2" aria-label="Pagination">{Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
        <Link key={number} href={catalogSearchHref(values, number)} aria-current={number === currentPage ? "page" : undefined} className={`flex size-11 items-center justify-center rounded-sm border ${number === currentPage ? "border-gold bg-gold text-ink" : "border-line"}`}>{number}</Link>
      ))}</nav>}
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
