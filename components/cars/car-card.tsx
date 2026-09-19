import Image from "next/image";
import Link from "next/link";
import { Fuel, Gauge, Users } from "lucide-react";
import { hasListedPrice, isYearReview } from "@/content/product-fleet";
import { carPublicLabel, type Car } from "@/types/domain";

export function CarCard({ car, priority = false }: { car: Car; priority?: boolean }) {
  const isFallback = car.imageUrl.includes("tourcoin-vehicle-fallback");
  const listedPrice = hasListedPrice(car.pricePerDay);
  const photoAlt = isFallback
    ? `Photographie de ${car.name} en cours de vérification`
    : isYearReview(car.year)
      ? `${car.name}, vue extérieure`
      : `${car.name} ${car.year}, vue extérieure`;

  return (
    <article className="group overflow-hidden rounded-lg border border-line bg-surface-raised">
      <Link href={`/cars/${car.slug}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-surface">
          <Image priority={priority} unoptimized={isFallback} src={car.imageUrl} alt={photoAlt} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
          <span className="absolute left-4 top-4 rounded-sm bg-ink/85 px-3 py-1 text-xs font-bold uppercase tracking-wider text-gold">{carPublicLabel(car)}</span>
        </div>
        <div className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div><p className="text-xs uppercase tracking-wider text-muted">{car.brand}</p><h3 className="mt-1 font-display text-xl font-semibold">{car.model}</h3></div>
            {listedPrice ? (
              <p className="text-right text-sm text-muted"><strong className="block text-xl text-ivory">{car.pricePerDay}</strong>MAD / jour</p>
            ) : (
              <p className="text-right text-sm font-semibold text-ivory">Prix sur demande</p>
            )}
          </div>
          <div className="mt-5 flex gap-5 border-t border-line pt-4 text-xs text-muted">
            <span className="flex items-center gap-2"><Gauge size={15} />{car.transmission}</span>
            <span className="flex items-center gap-2"><Fuel size={15} />{car.fuel}</span>
            <span className="flex items-center gap-2"><Users size={15} />{car.seats}</span>
          </div>
        </div>
      </Link>
    </article>
  );
}
