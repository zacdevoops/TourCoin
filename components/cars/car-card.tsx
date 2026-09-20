import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Fuel, Gauge, Users } from "lucide-react";

import { hasListedPrice, isYearReview } from "@/content/product-fleet";
import { carPublicLabel, type Car } from "@/types/domain";

export function CarCard({ car, priority = false }: { car: Car; priority?: boolean }) {
  const isFallback = car.imageUrl.includes("tourcoin-vehicle-fallback");
  const listedPrice = hasListedPrice(car.pricePerDay);
  const price = new Intl.NumberFormat("fr-MA").format(car.pricePerDay);
  const photoAlt = isFallback
    ? `Photographie de ${car.name} en cours de vérification`
    : isYearReview(car.year)
      ? `${car.name}, vue extérieure`
      : `${car.name} ${car.year}, vue extérieure`;

  return (
    <article className="group overflow-hidden border border-black/10 bg-white text-charcoal transition-shadow hover:shadow-card">
      <Link href={`/cars/${car.slug}`} className="block" aria-label={`Voir ${car.name}`}>
        <div className="relative aspect-[3/2] overflow-hidden bg-paper-muted">
          <Image
            loading={priority ? "eager" : "lazy"}
            unoptimized={isFallback}
            src={car.imageUrl}
            alt={photoAlt}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          />
          <span className="absolute left-3 top-3 bg-white/90 px-2.5 py-1 text-[0.65rem] font-extrabold uppercase text-charcoal backdrop-blur">
            {carPublicLabel(car)}
          </span>
        </div>
        <div className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[0.68rem] font-extrabold uppercase text-stone">
                {car.brand}
                {isYearReview(car.year) ? "" : ` · ${car.year}`}
              </p>
              <h3 className="mt-1 font-display text-2xl font-semibold">{car.model || car.name}</h3>
            </div>
            <ArrowUpRight className="size-5 text-stone transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
          </div>
          <div className="mt-4 flex flex-col items-start gap-4 border-t border-black/10 pt-4 xs:flex-row xs:items-end xs:justify-between">
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs font-semibold capitalize text-stone">
              <span className="flex items-center gap-1.5"><Gauge size={14} aria-hidden="true" />{car.transmission}</span>
              <span className="flex items-center gap-1.5"><Fuel size={14} aria-hidden="true" />{car.fuel}</span>
              <span className="flex items-center gap-1.5"><Users size={14} aria-hidden="true" />{car.seats}</span>
            </div>
            {listedPrice ? (
              <p className="shrink-0 text-left text-[0.65rem] text-stone xs:text-right">
                dès <strong className="block text-base text-charcoal">{price} {car.currency}</strong>/ jour
              </p>
            ) : (
              <p className="shrink-0 text-right text-sm font-semibold text-charcoal">Prix sur demande</p>
            )}
          </div>
        </div>
      </Link>
    </article>
  );
}
