import type { ReactNode } from "react";
import Image from "next/image";
import { DoorOpen, Fuel, Gauge, MessageCircle, Phone, Users } from "lucide-react";
import { hasListedPrice, isYearReview } from "@/content/product-fleet";
import { carPublicLabel, type Car } from "@/types/domain";
import { ButtonLink } from "@/components/ui/button-link";
import { vehicleWhatsAppMessage, whatsappHref, getContactPhoneHref } from "@/lib/contact/channels";

function capitalizeFr(value: string) {
  if (!value) return "";
  return value.charAt(0).toLocaleUpperCase("fr") + value.slice(1);
}

function specPills(car: Car) {
  const pills: { label: string; icon: ReactNode }[] = [];
  if (car.seats > 0) pills.push({ label: `${car.seats} Places`, icon: <Users size={16} aria-hidden="true" /> });
  if (car.transmission) pills.push({ label: capitalizeFr(car.transmission), icon: <Gauge size={16} aria-hidden="true" /> });
  if (car.fuel) pills.push({ label: capitalizeFr(car.fuel), icon: <Fuel size={16} aria-hidden="true" /> });
  if (car.doors > 0) pills.push({ label: `${car.doors} Portes`, icon: <DoorOpen size={16} aria-hidden="true" /> });
  return pills;
}

export function CarDetail({ car }: { car: Car }) {
  const isFallback = car.imageUrl.includes("tourcoin-vehicle-fallback");
  const listedPrice = hasListedPrice(car.pricePerDay);
  const category = carPublicLabel(car);
  const showYear = !isYearReview(car.year);
  const pills = specPills(car);
  const whatsapp = whatsappHref(vehicleWhatsAppMessage(car.name));
  const phone = getContactPhoneHref();
  const photoAlt = isFallback
    ? `Photographie de ${car.name} en cours de vérification`
    : showYear
      ? `${car.name} ${car.year}, vue extérieure`
      : `${car.name}, vue extérieure`;

  return (
    <article className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.22fr)_minmax(0,1fr)] lg:gap-x-12 xl:gap-x-16">
      <div className="relative aspect-[16/10] overflow-hidden rounded-sm bg-paper-muted lg:aspect-[4/3]">
        <Image
          preload
          unoptimized={isFallback}
          src={car.imageUrl}
          alt={photoAlt}
          fill
          sizes="(max-width: 1199px) 100vw, 55vw"
          className="object-cover"
        />
      </div>

      <div className="min-w-0">
        <p className="eyebrow">{category}</p>
        <h1 className="mt-3 font-display text-4xl font-semibold leading-tight text-balance sm:text-5xl">
          {car.name}
        </h1>
        <p className="mt-3 text-sm text-stone">
          {showYear ? `${car.year} · ${category}` : category}
        </p>

        {listedPrice ? (
          <p className="mt-6 font-display text-4xl font-semibold text-charcoal">
            {car.pricePerDay}{" "}
            <span className="text-base font-medium text-stone">MAD / jour</span>
          </p>
        ) : (
          <p className="mt-6 font-display text-3xl font-semibold text-charcoal">Prix sur demande</p>
        )}

        {pills.length > 0 && (
          <ul className="mt-6 flex flex-wrap gap-2.5" aria-label="Caractéristiques">
            {pills.map((pill) => (
              <li
                key={pill.label}
                className="inline-flex min-h-11 items-center gap-2 whitespace-nowrap rounded-full border border-black/10 bg-white px-3.5 text-sm text-charcoal"
              >
                <span className="text-gold">{pill.icon}</span>
                {pill.label}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <ButtonLink href={`/book?car=${car.id}`} className="min-h-12 w-full px-7 sm:w-auto">
            Réserver ce véhicule
          </ButtonLink>
          {whatsapp ? (
            <a
              href={whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-sm border border-black/20 bg-white px-7 text-sm font-bold text-charcoal transition-colors hover:border-charcoal sm:w-auto"
              aria-label={`Contacter Tourcoin sur WhatsApp à propos du ${car.name}`}
            >
              <MessageCircle size={18} aria-hidden="true" />
              WhatsApp
            </a>
          ) : null}
          {phone ? (
            <a
              href={phone}
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-sm border border-black/20 bg-white px-7 text-sm font-bold text-charcoal transition-colors hover:border-charcoal sm:w-auto"
              aria-label="Appeler Tourcoin"
            >
              <Phone size={18} aria-hidden="true" />
              Appeler
            </a>
          ) : null}
        </div>

        {car.description ? (
          <p className="mt-8 max-w-xl text-base leading-7 text-stone">{car.description}</p>
        ) : null}

        <p className="mt-5 max-w-xl text-sm leading-6 text-stone">
          Envoyez votre demande. Notre équipe vous contactera rapidement pour confirmer la disponibilité.
        </p>
      </div>
    </article>
  );
}
