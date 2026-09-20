import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CarCard } from "@/components/cars/car-card";
import { CarDetail } from "@/components/cars/car-detail";
import { ContactChoices } from "@/components/contact/contact-choices";
import { getCar, getFleet } from "@/lib/fleet/queries";
import { hasListedPrice } from "@/content/product-fleet";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { car } = await getCar(slug);
  if (!car) return { title: "Voiture introuvable" };
  return {
    title: `${car.name} à louer`,
    description: hasListedPrice(car.pricePerDay)
      ? `Louez la ${car.name} au Maroc à partir de ${car.pricePerDay} MAD par jour.`
      : `Louez la ${car.name} au Maroc. Prix sur demande.`,
    alternates: { canonical: `/cars/${car.slug}` },
    openGraph: { title: `${car.name} | Tourcoin`, description: car.description, images: [{ url: car.imageUrl, alt: `${car.name}, voiture de location` }] },
  };
}

export default async function CarPage({ params }: Props) {
  const { slug } = await params;
  const result = await getCar(slug);
  if (result.unavailable) {
    return (
      <div className="container-shell min-h-[65vh] pt-40">
        <h1 className="font-display text-4xl font-semibold">Catalogue momentanément indisponible</h1>
        <p className="mt-5 text-muted">Contactez notre équipe pour connaître les disponibilités.</p>
        <ContactChoices className="mt-6" />
      </div>
    );
  }
  if (!result.car) notFound();
  const car = result.car;
  const listedPrice = hasListedPrice(car.pricePerDay);
  const fleet = await getFleet();
  const related = fleet.cars.filter((item) => item.id !== car.id && (item.category === car.category || item.brand === car.brand)).slice(0, 3);
  const jsonLd = listedPrice
    ? { "@context": "https://schema.org", "@type": "Product", name: car.name, image: car.imageUrl, description: car.description, offers: { "@type": "Offer", price: car.pricePerDay, priceCurrency: "MAD", url: `/cars/${car.slug}` } }
    : { "@context": "https://schema.org", "@type": "Product", name: car.name, image: car.imageUrl, description: car.description };

  return (
    <div className="pb-24 pt-28">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <div className="container-shell">
        <CarDetail car={car} />
        {related.length > 0 && (
          <section className="mt-16 border-t border-line pt-14">
            <p className="eyebrow">Dans le même esprit</p>
            <h2 className="mt-3 font-display text-3xl font-semibold">Vous aimerez aussi</h2>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {related.map((item) => <CarCard car={item} key={item.id} />)}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
