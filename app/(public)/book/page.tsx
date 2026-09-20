import type { Metadata } from "next";

import { BookingForm } from "@/components/booking/booking-form";
import { getActiveBookingCars } from "@/lib/booking/fleet";

export const metadata: Metadata = {
  title: "Réserver une voiture",
  description:
    "Envoyez votre demande de location de voiture au Maroc. Notre équipe confirme rapidement la disponibilité.",
  alternates: { canonical: "/book" },
};

interface BookingPageProps {
  searchParams: Promise<{ car?: string | string[] }>;
}

export default async function BookingPage({ searchParams }: BookingPageProps) {
  const [cars, params] = await Promise.all([
    getActiveBookingCars(),
    searchParams,
  ]);
  const requestedCar = typeof params.car === "string" ? params.car : undefined;
  const initialCarId = cars.find(
    (car) => car.id === requestedCar || car.slug === requestedCar,
  )?.id;

  return (
    <div className="min-h-screen bg-paper pb-24 pt-36 text-charcoal">
      <section className="container-shell">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div className="lg:sticky lg:top-28">
            <p className="eyebrow">Votre séjour commence ici</p>
            <h1 className="mt-4 font-display text-4xl font-semibold leading-tight text-balance sm:text-5xl">
              Demandez votre réservation
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-stone">
              Indiquez votre véhicule et vos horaires. Notre équipe vérifie la
              disponibilité puis confirme personnellement votre location.
            </p>
            <div className="mt-8 hidden border-y border-black/10 py-5 lg:block">
              <h2 className="font-display text-lg font-semibold">
                Une réservation en toute sérénité
              </h2>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-stone">
                <li>Tarif du véhicule enregistré avec votre demande</li>
                <li>Prise en charge dans les principales villes et aéroports</li>
                <li>Confirmation humaine avant tout engagement définitif</li>
              </ul>
            </div>
          </div>
          <BookingForm cars={cars} initialCarId={initialCarId} />
        </div>
      </section>
    </div>
  );
}
