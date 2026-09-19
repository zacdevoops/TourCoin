"use client";

import { CalendarDays, MapPin } from "lucide-react";
import { useRef, useState, type FormEvent } from "react";

import { PICKUP_LOCATIONS } from "@/lib/booking/constants";
import { addCalendarDays } from "@/lib/booking/datetime";

const fieldClass =
  "field mt-2 min-h-12 border-line bg-ink text-ivory focus:border-gold";

export function HomeSearch({ today }: { today: string }) {
  const returnInputRef = useRef<HTMLInputElement>(null);
  const [pickup, setPickup] = useState("");
  const [pickupError, setPickupError] = useState("");
  const [returnError, setReturnError] = useState("");
  const pickupErrorId = "home-search-pickup-error";
  const returnErrorId = "home-search-return-error";
  const returnMin = pickup ? addCalendarDays(pickup, 1) : addCalendarDays(today, 1);

  function onPickupChange(value: string) {
    setPickup(value);
    setPickupError("");
    const returnInput = returnInputRef.current;
    if (returnInput?.value && returnInput.value <= value) {
      returnInput.value = "";
      setReturnError("La date de retour doit être après le départ.");
    } else {
      setReturnError("");
    }
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    const form = event.currentTarget;
    const pickupValue = String(new FormData(form).get("pickup") ?? "");
    const returnValue = String(new FormData(form).get("return") ?? "");
    let invalid = false;

    if (!pickupValue || pickupValue < today) {
      setPickupError("Choisissez une date de départ à partir d’aujourd’hui.");
      invalid = true;
    } else {
      setPickupError("");
    }

    if (!returnValue || returnValue <= pickupValue) {
      setReturnError("La date de retour doit être après le départ.");
      invalid = true;
    } else {
      setReturnError("");
    }

    if (invalid) event.preventDefault();
  }

  return (
    <section
      className="rounded-md border border-gold/40 bg-surface p-4 sm:p-5 lg:p-6"
      aria-labelledby="home-search-title"
    >
      <p id="home-search-title" className="text-sm leading-6 text-muted">
        Sélectionnez votre départ et vos dates — TourCoin confirmera la
        disponibilité.
      </p>
      <form
        action="/cars"
        method="get"
        onSubmit={onSubmit}
        className="mt-4 grid items-end gap-4 md:grid-cols-2 lg:grid-cols-4"
      >
        <div>
          <label htmlFor="home-location" className="block text-sm font-semibold text-ivory">
            <span className="inline-flex items-center gap-2">
              <MapPin className="size-4 text-gold" aria-hidden="true" />
              Lieu de départ
            </span>
          </label>
          <select
            id="home-location"
            name="location"
            required
            className={fieldClass}
            defaultValue=""
          >
            <option value="" disabled>
              Sélectionnez un lieu
            </option>
            {PICKUP_LOCATIONS.map((location) => (
              <option key={location.slug} value={location.slug}>
                {location.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="home-pickup" className="block text-sm font-semibold text-ivory">
            <span className="inline-flex items-center gap-2">
              <CalendarDays className="size-4 text-gold" aria-hidden="true" />
              Date de départ
            </span>
          </label>
          <input
            id="home-pickup"
            name="pickup"
            type="date"
            required
            min={today}
            onChange={(event) => onPickupChange(event.target.value)}
            aria-invalid={pickupError ? true : undefined}
            aria-describedby={pickupError ? pickupErrorId : undefined}
            className={fieldClass}
            suppressHydrationWarning
          />
          {pickupError ? (
            <p id={pickupErrorId} className="mt-2 text-sm text-danger">
              {pickupError}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="home-return" className="block text-sm font-semibold text-ivory">
            <span className="inline-flex items-center gap-2">
              <CalendarDays className="size-4 text-gold" aria-hidden="true" />
              Date de retour
            </span>
          </label>
          <input
            id="home-return"
            ref={returnInputRef}
            name="return"
            type="date"
            required
            min={returnMin}
            onChange={() => setReturnError("")}
            aria-invalid={returnError ? true : undefined}
            aria-describedby={returnError ? returnErrorId : undefined}
            className={fieldClass}
            suppressHydrationWarning
          />
          {returnError ? (
            <p id={returnErrorId} className="mt-2 text-sm text-danger">
              {returnError}
            </p>
          ) : null}
        </div>

        <button
          type="submit"
          className="min-h-12 w-full rounded-sm bg-gold px-5 font-bold text-ink hover:bg-gold-strong"
        >
          Voir les voitures
        </button>
      </form>
    </section>
  );
}
