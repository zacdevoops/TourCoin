import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Demande reçue | Tourcoin",
  robots: { index: false, follow: false },
};

interface ConfirmationPageProps {
  searchParams: Promise<{ reference?: string | string[] }>;
}

export default async function ConfirmationPage({
  searchParams,
}: ConfirmationPageProps) {
  const params = await searchParams;
  const candidate =
    typeof params.reference === "string" ? params.reference : undefined;
  const reference =
    candidate && /^TC-[A-Z0-9]{8}$/.test(candidate) ? candidate : null;

  return (
    <div className="flex min-h-screen items-center bg-paper py-28 text-charcoal">
      <section className="container-shell">
        <div className="mx-auto max-w-2xl rounded-sm border border-black/10 bg-white p-7 text-center shadow-card sm:p-12">
          <div
            className="mx-auto flex size-14 items-center justify-center rounded-full border border-gold text-2xl text-gold"
            aria-hidden="true"
          >
            ✓
          </div>
          <p className="eyebrow mt-6">Demande reçue</p>
          <h1 className="mt-3 font-display text-3xl font-bold text-balance sm:text-4xl">
            Merci pour votre confiance
          </h1>
          <p className="mx-auto mt-5 max-w-xl leading-7 text-stone">
            Votre demande a bien été enregistrée. Notre équipe va maintenant
            vérifier la disponibilité du véhicule et vous contactera pour
            confirmer personnellement votre réservation.
          </p>
          {reference ? (
            <div className="mt-7 rounded-sm border border-black/10 bg-paper-muted p-4">
              <span className="block text-xs font-bold uppercase text-stone">
                Votre référence
              </span>
              <strong className="mt-1 block font-display text-xl tracking-wider text-gold">
                {reference}
              </strong>
            </div>
          ) : null}
          <p className="mt-6 text-sm leading-6 text-stone">
            Cette confirmation atteste la réception de votre demande. Elle ne
            garantit pas encore la disponibilité du véhicule.
          </p>
          <Link
            className="mt-8 inline-flex min-h-12 items-center justify-center rounded-sm bg-charcoal px-7 py-3 font-bold text-white transition-colors hover:bg-black"
            href="/"
          >
            Retour à l’accueil
          </Link>
        </div>
      </section>
    </div>
  );
}
