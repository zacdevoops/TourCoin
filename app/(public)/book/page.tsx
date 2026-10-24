import type { Metadata } from "next";

import { BookingForm } from "@/components/booking/booking-form";
import { getActiveBookingCars } from "@/lib/booking/fleet";
import { PICKUP_LOCATIONS } from "@/lib/booking/constants";
import { casablancaCalendarDate, isReturnAfterDeparture } from "@/lib/booking/datetime";
import { sanitizeCatalogValues } from "@/lib/catalog/params";

export const metadata: Metadata = {
  title: "Réserver une voiture",
  description:
    "Envoyez votre demande de location de voiture au Maroc. Notre équipe confirme rapidement la disponibilité.",
  alternates: { canonical: "/book" },
};

interface BookingPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function BookingPage({ searchParams }: BookingPageProps) {
  const [cars, params] = await Promise.all([getActiveBookingCars(), searchParams]);
  const param = (key: string) => typeof params[key] === "string" ? params[key] as string : undefined;
  const requestedCar = param("car");
  const initialCarId = cars.find(
    (car) => car.id === requestedCar || car.slug === requestedCar,
  )?.id;
  const trip = sanitizeCatalogValues({
    location: param("location"),
    pickup: param("pickup"),
    return: param("return"),
  });
  const today = casablancaCalendarDate();
  const initialPickupDate = trip.pickup && trip.pickup >= today ? trip.pickup : undefined;
  const initialReturnDate =
    initialPickupDate && trip.return && isReturnAfterDeparture(initialPickupDate, trip.return)
      ? trip.return
      : undefined;
  const initialPickupLocation = PICKUP_LOCATIONS.find(
    (location) => location.slug === trip.location,
  )?.label;

  return (
    <div className="min-h-screen bg-paper pb-20 pt-28 text-charcoal sm:pb-24 sm:pt-36">
      <section className="container-shell">
        <div className="mx-auto mb-8 max-w-3xl text-center sm:mb-10">
          <p className="eyebrow">Réservation Tourcoin</p>
          <h1 className="mt-3 font-display text-4xl font-semibold leading-none text-balance sm:text-6xl">
            Votre voiture, vos dates, une confirmation claire.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-stone">
            Vérifiez le véhicule, indiquez votre trajet et envoyez une demande
            propre à notre équipe locale.
          </p>
        </div>
        <div className="mx-auto max-w-7xl">
          <BookingForm
            cars={cars}
            initialCarId={initialCarId}
            initialPickupLocation={initialPickupLocation}
            initialReturnLocation={initialPickupLocation}
            initialPickupDate={initialPickupDate}
            initialReturnDate={initialReturnDate}
          />
        </div>
      </section>
    </div>
  );
}
