import { HomePage } from "@/components/home/home-page";
import { resolvePublicSiteUrl } from "@/lib/auth/site-url";
import { getFleet } from "@/lib/fleet/queries";

export default async function Page() {
  const { cars, unavailable } = await getFleet();
  const featured = cars.filter((car) => car.featured);
  const siteUrl = resolvePublicSiteUrl();
  const structuredData = {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "AutoRental"],
    name: "Tourcoin",
    url: siteUrl,
    areaServed: { "@type": "Country", name: "Maroc" },
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
      <HomePage cars={featured.length ? featured : cars} unavailable={unavailable} />
    </>
  );
}
