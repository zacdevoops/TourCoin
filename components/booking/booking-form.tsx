"use client";

import { useRouter } from "next/navigation";
import { useMemo, useRef, useState, type FormEvent } from "react";

import { ContactChoices } from "@/components/contact/contact-choices";
import { BOOKING_LOCATIONS } from "@/lib/booking/constants";
import {
  addCalendarDays,
  casablancaCalendarDate,
  isReturnAfterDeparture,
  RETURN_DATE_AFTER_DEPARTURE_MESSAGE,
} from "@/lib/booking/datetime";
import type { BookingCarOption } from "@/lib/booking/fleet";

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
  "field-light mt-2 transition-colors focus:border-charcoal focus:outline-none";
const labelClass = "block text-sm font-semibold text-charcoal";

export function BookingForm({ cars, initialCarId }: BookingFormProps) {
  const router = useRouter();
  const returnDateRef = useRef<HTMLInputElement>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [pickupDate, setPickupDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [returnError, setReturnError] = useState("");
  const minimumDate = useMemo(() => casablancaCalendarDate(), []);
  const returnMin = pickupDate
    ? addCalendarDays(pickupDate, 1)
    : addCalendarDays(minimumDate, 1);
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

    const form = event.currentTarget;
    const data = new FormData(form);
    const payload = {
      carId: String(data.get("carId") ?? ""),
      name: String(data.get("name") ?? ""),
      email: String(data.get("email") ?? ""),
      phone: String(data.get("phone") ?? ""),
      pickupLocation: String(data.get("pickupLocation") ?? ""),
      pickupDate: String(data.get("pickupDate") ?? ""),
      pickupTime: String(data.get("pickupTime") ?? ""),
      returnLocation: String(data.get("returnLocation") ?? ""),
      returnDate: String(data.get("returnDate") ?? ""),
      returnTime: String(data.get("returnTime") ?? ""),
      message: String(data.get("message") ?? ""),
      website: String(data.get("website") ?? ""),
    };

    if (!isReturnAfterDeparture(payload.pickupDate, payload.returnDate)) {
      setReturnError(RETURN_DATE_AFTER_DEPARTURE_MESSAGE);
      returnDateRef.current?.focus();
      return;
    }

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

  if (cars.length === 0) {
    return (
      <div
        className="rounded-sm border border-black/10 bg-white p-6 text-stone"
        role="status"
      >
        Aucun véhicule n’est actuellement proposé à la réservation en ligne.
        Contactez-nous pour connaître les disponibilités.
        <ContactChoices className="mt-5" />
      </div>
    );
  }

  return (
    <form
      className="rounded-sm border border-black/10 bg-white p-5 shadow-card sm:p-8"
      onSubmit={handleSubmit}
    >
      <div className="grid gap-6 md:grid-cols-2">
        <label className={`${labelClass} md:col-span-2`}>
          Véhicule
          <select
            className={fieldClass}
            name="carId"
            defaultValue={initialCarId ?? ""}
            required
          >
            <option value="" disabled>
              Sélectionnez un véhicule
            </option>
            {cars.map((car) => (
              <option key={car.id} value={car.id}>
                {car.name} — {car.pricePerDay.toLocaleString("fr-FR")}{" "}
                {car.currency}/jour
              </option>
            ))}
          </select>
        </label>

        <label className={labelClass}>
          Nom complet
          <input
            className={fieldClass}
            name="name"
            type="text"
            autoComplete="name"
            minLength={2}
            maxLength={100}
            required
          />
        </label>
        <label className={labelClass}>
          Adresse e-mail
          <input
            className={fieldClass}
            name="email"
            type="email"
            autoComplete="email"
            maxLength={254}
            required
          />
        </label>
        <label className={`${labelClass} md:col-span-2`}>
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

        <fieldset className="grid gap-5 rounded-sm border border-black/10 p-4 md:col-span-2 md:grid-cols-2">
          <legend className="px-2 font-display text-lg font-semibold text-charcoal">
            Prise en charge
          </legend>
          <label className={`${labelClass} md:col-span-2`}>
            Lieu
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
            Date
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
            Heure
            <input className={fieldClass} name="pickupTime" type="time" required />
          </label>
        </fieldset>

        <fieldset className="grid gap-5 rounded-sm border border-black/10 p-4 md:col-span-2 md:grid-cols-2">
          <legend className="px-2 font-display text-lg font-semibold text-charcoal">
            Retour
          </legend>
          <label className={`${labelClass} md:col-span-2`}>
            Lieu
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
            Date
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
                setReturnDate(event.target.value);
                setReturnError("");
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
          <label className={labelClass}>
            Heure
            <input className={fieldClass} name="returnTime" type="time" required />
          </label>
        </fieldset>

        <label className={`${labelClass} md:col-span-2`}>
          Message <span className="font-normal text-stone">(facultatif)</span>
          <textarea
            className={`${fieldClass} min-h-32 resize-y`}
            name="message"
            maxLength={1000}
            placeholder="Vol, siège enfant ou toute autre précision utile…"
          />
        </label>
      </div>

      <div className="absolute -left-[9999px]" aria-hidden="true">
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

      <div className="mt-7" aria-live="polite">
        {error ? (
          <p
            className="mb-4 rounded-sm border border-danger/40 bg-danger/5 p-3 text-sm text-danger"
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
          {submitting ? "Envoi en cours…" : "Envoyer ma demande"}
        </button>
        <p className="mt-3 text-center text-xs leading-5 text-stone">
          L’envoi de ce formulaire constitue une demande. La réservation devient
          définitive après confirmation de disponibilité par notre équipe.
        </p>
      </div>
    </form>
  );
}
