"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  CarFront,
  DoorOpen,
  Fuel,
  Gauge,
  ShieldCheck,
  Users,
} from "lucide-react";
import { useMemo, useRef, useState, type FormEvent } from "react";

import { ContactChoices } from "@/components/contact/contact-choices";
import { hasListedPrice } from "@/content/product-fleet";
import { BOOKING_LOCATIONS } from "@/lib/booking/constants";
import {
  addCalendarDays,
  casablancaCalendarDate,
  isReturnAfterDeparture,
  RETURN_DATE_AFTER_DEPARTURE_MESSAGE,
} from "@/lib/booking/datetime";
import type { BookingCarOption } from "@/lib/booking/fleet";
import { carPublicLabel } from "@/types/domain";

interface BookingFormProps {
  cars: BookingCarOption[];
  initialCarId?: string;
}

interface BookingApiResponse {
  ok: boolean;
  reference?: string;
  error?: string;
}

const fieldClass =
  "field-light mt-2 min-h-12 transition-colors focus:border-charcoal focus:outline-none";
const labelClass = "block text-sm font-semibold text-charcoal";
const money = new Intl.NumberFormat("fr-MA");

function capitalizeFr(value: string) {
  if (!value) return "";
  return value.charAt(0).toLocaleUpperCase("fr") + value.slice(1);
}

function rentalDays(pickupDate: string, returnDate: string) {
  if (!isReturnAfterDeparture(pickupDate, returnDate)) return 0;
  const pickup = Date.parse(`${pickupDate}T00:00:00Z`);
  const dropoff = Date.parse(`${returnDate}T00:00:00Z`);
  if (!Number.isFinite(pickup) || !Number.isFinite(dropoff)) return 0;
  return Math.max(0, Math.ceil((dropoff - pickup) / 86_400_000));
}

function carPrice(car: BookingCarOption) {
  return hasListedPrice(car.pricePerDay)
    ? `${money.format(car.pricePerDay)} ${car.currency}`
    : "Prix sur demande";
}

function CarVisual({ car }: { car: BookingCarOption }) {
  const isFallback = car.imageUrl.includes("tourcoin-vehicle-fallback");
  const specs = [
    car.seats > 0 ? { label: `${car.seats} places`, icon: Users } : null,
    car.transmission ? { label: capitalizeFr(car.transmission), icon: Gauge } : null,
    car.fuel ? { label: capitalizeFr(car.fuel), icon: Fuel } : null,
    car.doors > 0 ? { label: `${car.doors} portes`, icon: DoorOpen } : null,
  ].filter(Boolean) as { label: string; icon: typeof Users }[];

  return (
    <aside className="space-y-6 lg:sticky lg:top-28">
      <div className="overflow-hidden border border-black/10 bg-white shadow-card">
        <div className="relative aspect-[4/3] overflow-hidden bg-paper-muted sm:aspect-[16/10] lg:aspect-[4/3]">
          <Image
            priority
            unoptimized={isFallback}
            src={car.imageUrl}
            alt={`${car.name}, vue extérieure`}
            fill
            sizes="(max-width: 1023px) 100vw, 50vw"
            className="object-cover"
          />
        </div>
        <div className="p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="eyebrow">{carPublicLabel(car)}</p>
              <h1 className="mt-2 font-display text-4xl font-semibold leading-none text-charcoal sm:text-5xl">
                {car.name}
              </h1>
              <p className="mt-3 text-sm font-semibold text-stone">
                {car.brand}
                {car.model ? ` · ${car.model}` : ""}
              </p>
            </div>
            <p className="shrink-0 text-left sm:text-right">
              <span className="block text-xs font-extrabold uppercase text-stone">Tarif jour</span>
              <span className="font-display text-3xl font-semibold text-charcoal">
                {carPrice(car)}
              </span>
            </p>
          </div>

          {specs.length > 0 ? (
            <ul className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-2" aria-label="Caractéristiques du véhicule">
              {specs.map(({ label, icon: Icon }) => (
                <li
                  key={label}
                  className="flex min-h-12 items-center gap-2 border border-black/10 bg-paper px-3 text-sm font-semibold text-charcoal"
                >
                  <Icon className="size-4 shrink-0 text-gold" aria-hidden="true" />
                  <span>{label}</span>
                </li>
              ))}
            </ul>
          ) : null}

          {car.description ? (
            <p className="mt-6 text-sm leading-7 text-stone">{car.description}</p>
          ) : null}
        </div>
      </div>
    </aside>
  );
}

function SummaryRow({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-black/10 py-3 last:border-b-0">
      <span className="text-sm text-stone">{label}</span>
      <span className={strong ? "text-base font-extrabold text-charcoal" : "text-sm font-bold text-charcoal"}>
        {value}
      </span>
    </div>
  );
}

export function BookingForm({ cars, initialCarId }: BookingFormProps) {
  const router = useRouter();
  const returnDateRef = useRef<HTMLInputElement>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [selectedCarId, setSelectedCarId] = useState(initialCarId ?? cars[0]?.id ?? "");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [pickupDate, setPickupDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [returnError, setReturnError] = useState("");
  const minimumDate = useMemo(() => casablancaCalendarDate(), []);
  const returnMin = pickupDate
    ? addCalendarDays(pickupDate, 1)
    : addCalendarDays(minimumDate, 1);
  const selectedCar = cars.find((car) => car.id === selectedCarId) ?? cars[0];
  const days = rentalDays(pickupDate, returnDate);
  const canCalculate = Boolean(selectedCar && hasListedPrice(selectedCar.pricePerDay) && days > 0);
  const subtotal = canCalculate ? selectedCar.pricePerDay * days : 0;
  const returnErrorId = "booking-return-date-error";

  function onPickupDateChange(value: string) {
    setPickupDate(value);
    if (returnDate && !isReturnAfterDeparture(value, returnDate)) {
      setReturnDate("");
      setReturnError(RETURN_DATE_AFTER_DEPARTURE_MESSAGE);
      returnDateRef.current?.focus();
    } else {
      setReturnError("");
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
    if (fullName.length < 2) {
      setError("Veuillez saisir votre nom et prénom.");
      return;
    }
    if (!isReturnAfterDeparture(pickupDate, returnDate)) {
      setReturnError(RETURN_DATE_AFTER_DEPARTURE_MESSAGE);
      returnDateRef.current?.focus();
      return;
    }

    const form = event.currentTarget;
    const data = new FormData(form);
    const payload = {
      carId: String(data.get("carId") ?? ""),
      name: fullName,
      email: String(data.get("email") ?? ""),
      phone: String(data.get("phone") ?? ""),
      pickupLocation: String(data.get("pickupLocation") ?? ""),
      pickupDate,
      pickupTime: "10:00",
      returnLocation: String(data.get("returnLocation") ?? ""),
      returnDate,
      returnTime: "10:00",
      message: String(data.get("message") ?? ""),
      website: String(data.get("website") ?? ""),
    };

    setSubmitting(true);

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as BookingApiResponse;

      if (!response.ok || !result.ok || !result.reference) {
        setError(
          result.error ??
            "Une erreur est survenue. Veuillez vérifier vos informations.",
        );
        return;
      }

      router.push(
        `/book/confirmation?reference=${encodeURIComponent(result.reference)}`,
      );
    } catch {
      setError(
        "Impossible de contacter le service. Vérifiez votre connexion et réessayez.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (cars.length === 0 || !selectedCar) {
    return (
      <div
        className="border border-black/10 bg-white p-6 text-stone shadow-card"
        role="status"
      >
        Aucun véhicule n’est actuellement proposé à la réservation en ligne.
        Contactez-nous pour connaître les disponibilités.
        <ContactChoices className="mt-5" />
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(25rem,0.95fr)] lg:items-start">
      <CarVisual car={selectedCar} />

      <form
        className="border border-black/10 bg-white p-5 shadow-card sm:p-7 lg:p-8"
        onSubmit={handleSubmit}
      >
        <div className="flex items-start justify-between gap-4 border-b border-black/10 pb-5">
          <div>
            <p className="eyebrow">Demande de réservation</p>
            <h2 className="mt-2 font-display text-3xl font-semibold leading-tight text-charcoal">
              Finaliser votre trajet
            </h2>
          </div>
          <CarFront className="mt-1 hidden size-7 text-gold sm:block" aria-hidden="true" />
        </div>

        <label className={`${labelClass} mt-6`}>
          Véhicule
          <select
            className={fieldClass}
            name="carId"
            value={selectedCarId}
            onChange={(event) => setSelectedCarId(event.target.value)}
            required
          >
            {cars.map((car) => (
              <option key={car.id} value={car.id}>
                {car.name} — {carPrice(car)}/jour
              </option>
            ))}
          </select>
        </label>

        <section className="mt-7" aria-labelledby="booking-personal-title">
          <h3 id="booking-personal-title" className="font-display text-2xl font-semibold text-charcoal">
            Informations personnelles
          </h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className={labelClass}>
              Nom
              <input
                className={fieldClass}
                name="lastName"
                type="text"
                autoComplete="family-name"
                minLength={2}
                maxLength={60}
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                required
              />
            </label>
            <label className={labelClass}>
              Prénom
              <input
                className={fieldClass}
                name="firstName"
                type="text"
                autoComplete="given-name"
                minLength={2}
                maxLength={60}
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                required
              />
            </label>
            <label className={labelClass}>
              Email
              <input
                className={fieldClass}
                name="email"
                type="email"
                autoComplete="email"
                maxLength={254}
                required
              />
            </label>
            <label className={labelClass}>
              Téléphone
              <input
                className={fieldClass}
                name="phone"
                type="tel"
                autoComplete="tel"
                inputMode="tel"
                minLength={8}
                maxLength={24}
                placeholder="+212 6 00 00 00 00"
                required
              />
            </label>
          </div>
        </section>

        <section className="mt-8" aria-labelledby="booking-trip-title">
          <h3 id="booking-trip-title" className="font-display text-2xl font-semibold text-charcoal">
            Réservation
          </h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className={labelClass}>
              Lieu de départ
              <select className={fieldClass} name="pickupLocation" required>
                <option value="">Sélectionnez un lieu</option>
                {BOOKING_LOCATIONS.map((location) => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </select>
            </label>
            <label className={labelClass}>
              Date de départ
              <input
                className={fieldClass}
                name="pickupDate"
                type="date"
                min={minimumDate}
                required
                value={pickupDate}
                onChange={(event) => onPickupDateChange(event.target.value)}
                suppressHydrationWarning
              />
            </label>
            <label className={labelClass}>
              Lieu de retour
              <select className={fieldClass} name="returnLocation" required>
                <option value="">Sélectionnez un lieu</option>
                {BOOKING_LOCATIONS.map((location) => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </select>
            </label>
            <label className={labelClass}>
              Date de retour
              <input
                ref={returnDateRef}
                className={fieldClass}
                name="returnDate"
                type="date"
                min={returnMin}
                required
                disabled={!pickupDate}
                value={returnDate}
                onChange={(event) => {
                  const nextReturnDate = event.target.value;
                  setReturnDate(nextReturnDate);
                  setReturnError(
                    nextReturnDate && pickupDate && !isReturnAfterDeparture(pickupDate, nextReturnDate)
                      ? RETURN_DATE_AFTER_DEPARTURE_MESSAGE
                      : "",
                  );
                }}
                aria-invalid={returnError ? true : undefined}
                aria-describedby={returnError ? returnErrorId : undefined}
                suppressHydrationWarning
              />
              {returnError ? (
                <span id={returnErrorId} className="mt-2 block text-sm font-normal text-danger" role="alert">
                  {returnError}
                </span>
              ) : null}
            </label>
          </div>

          <label className={`${labelClass} mt-4`}>
            Message <span className="font-normal text-stone">(facultatif)</span>
            <textarea
              className={`${fieldClass} min-h-28 resize-y`}
              name="message"
              maxLength={1000}
              placeholder="Vol, siège enfant ou toute autre précision utile..."
            />
          </label>
        </section>

        <section className="mt-8 border border-black/10 bg-paper p-4 sm:p-5" aria-labelledby="booking-summary-title" aria-live="polite">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-5 text-gold" aria-hidden="true" />
            <h3 id="booking-summary-title" className="font-display text-2xl font-semibold text-charcoal">
              Résumé
            </h3>
          </div>
          <div className="mt-4">
            <SummaryRow label="Véhicule" value={selectedCar.name} />
            <SummaryRow label="Prix par jour" value={`${carPrice(selectedCar)}${hasListedPrice(selectedCar.pricePerDay) ? " / jour" : ""}`} />
            <SummaryRow label="Nombre de jours" value={days > 0 ? `${days}` : "Sélectionnez vos dates"} />
            <SummaryRow
              label="Sous-total"
              value={canCalculate ? `${money.format(subtotal)} ${selectedCar.currency}` : "À calculer"}
            />
            <SummaryRow
              label="Total"
              value={canCalculate ? `${money.format(subtotal)} ${selectedCar.currency}` : "À calculer"}
              strong
            />
          </div>
          <p className="mt-4 flex gap-2 text-xs leading-5 text-stone">
            <Briefcase className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden="true" />
            Le total affiché correspond au tarif journalier multiplié par le nombre de jours. Notre équipe confirme ensuite les conditions finales.
          </p>
        </section>

        <div className="sr-only" aria-hidden="true">
          <label>
            Site web
            <input
              name="website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
            />
          </label>
        </div>

        <div className="mt-7">
          {error ? (
            <p
              className="mb-4 border border-danger/40 bg-danger/5 p-3 text-sm text-danger"
              role="alert"
            >
              {error}
            </p>
          ) : null}
          <button
            className="inline-flex min-h-12 w-full items-center justify-center rounded-sm bg-charcoal px-6 py-3 font-bold text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
            type="submit"
            disabled={submitting}
          >
            {submitting ? "Envoi en cours..." : "Confirmer ma demande"}
          </button>
          <p className="mt-3 text-center text-xs leading-5 text-stone">
            La réservation devient définitive après confirmation de disponibilité par notre équipe.
          </p>
        </div>
      </form>
    </div>
  );
}
