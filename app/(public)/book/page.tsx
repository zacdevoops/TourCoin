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
    <main className="min-h-screen bg-ink">
      <section className="container-shell section-space">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div className="lg:sticky lg:top-10">
            <p className="eyebrow">Votre séjour commence ici</p>
            <h1 className="mt-4 font-display text-4xl font-bold leading-tight text-balance sm:text-5xl">
              Demandez votre réservation
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-muted">
              Choisissez votre véhicule et vos horaires. Un membre de notre
              équipe vérifie la disponibilité et vous contacte pour confirmer
              personnellement votre location.
            </p>
            <div className="mt-8 rounded-[var(--radius-md)] border border-line p-5">
              <h2 className="font-display text-lg font-semibold">
                Une réservation en toute sérénité
              </h2>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-muted">
                <li>Tarif du véhicule enregistré avec votre demande</li>
                <li>Prise en charge dans les principales villes et aéroports</li>
                <li>Confirmation humaine avant tout engagement définitif</li>
              </ul>
            </div>
          </div>
          <BookingForm cars={cars} initialCarId={initialCarId} />
        </div>
      </section>
    </main>
  );
}
