import { HomePage } from "@/components/home/home-page";
import { resolvePublicSiteUrl } from "@/lib/auth/site-url";

export default async function Page() {
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
      <HomePage />
    </>
  );
}
