import { HomePage } from "@/components/home/home-page";
import { HOME_FAQS } from "@/content/home";
import { resolvePublicSiteUrl } from "@/lib/auth/site-url";

export default function Page() {
  const siteUrl = resolvePublicSiteUrl();
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["LocalBusiness", "AutoRental"],
        name: "Tourcoin",
        url: siteUrl,
        areaServed: [
          { "@type": "Country", name: "Maroc" },
          ...["Casablanca", "Marrakech", "Rabat", "Tanger"].map((name) => ({ "@type": "City", name })),
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: HOME_FAQS.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: { "@type": "Answer", text: item.answer },
        })),
      },
    ],
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
      <HomePage />
    </>
  );
}
