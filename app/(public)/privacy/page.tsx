import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description: "Politique de confidentialité de Tourcoin.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <article className="container-shell max-w-4xl bg-paper pb-24 pt-40 text-charcoal">
      <p className="eyebrow">Vos données</p>
      <h1 className="mt-4 font-display text-4xl font-semibold sm:text-6xl">Politique de confidentialité</h1>
      <p className="mt-6 text-sm text-stone">Dernière mise à jour : 18 septembre 2026</p>
      <div className="mt-12 space-y-10 leading-8 text-stone">
        <Section title="Données collectées">Lorsque vous nous contactez ou demandez une réservation, nous pouvons recueillir vos coordonnées, les informations relatives au trajet souhaité et le contenu de vos échanges avec notre équipe.</Section>
        <Section title="Pourquoi nous les utilisons">Ces données servent uniquement à répondre à votre demande, préparer votre location, assurer le suivi client et respecter nos obligations légales.</Section>
        <Section title="Conservation et partage">Nous conservons les données pendant la durée nécessaire à ces finalités. Elles ne sont pas vendues. Elles peuvent être traitées par nos prestataires techniques dans le cadre strict de leur mission.</Section>
        <Section title="Vos droits">Vous pouvez demander l’accès, la rectification ou la suppression de vos données en utilisant notre <Link className="text-charcoal underline decoration-gold underline-offset-4" href="/contact">page de contact</Link>. Nous traiterons votre demande conformément au droit applicable.</Section>
        <Section title="Sécurité">Nous mettons en œuvre des mesures techniques et organisationnelles raisonnables pour protéger les informations qui nous sont confiées.</Section>
      </div>
    </article>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) { return <section><h2 className="font-display text-2xl font-semibold text-charcoal">{title}</h2><p className="mt-3">{children}</p></section>; }
