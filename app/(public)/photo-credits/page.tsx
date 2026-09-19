import type { Metadata } from "next";
import { FLEET_PHOTO_SOURCES } from "@/content/fleet-photo-sources";

export const metadata: Metadata = {
  title: "Crédits photographiques",
  description: "Sources et licences des photographies de véhicules Tourcoin.",
  alternates: { canonical: "/photo-credits" },
};

export default function PhotoCreditsPage() {
  return (
    <main className="container-shell pb-24 pt-40">
      <p className="eyebrow">Transparence</p>
      <h1 className="mt-4 font-display text-4xl font-semibold sm:text-6xl">
        Crédits photographiques
      </h1>
      <p className="mt-6 max-w-3xl text-lg leading-8 text-muted">
        Les photographies ci-dessous proviennent de Wikimedia Commons, utilisées
        selon leurs licences Creative Commons, ou de la flotte client TourCoin.
        Les fichiers Commons ont été redimensionnés et convertis en WebP.
      </p>
      <ul className="mt-12 divide-y divide-line border-y border-line">
        {FLEET_PHOTO_SOURCES.map((source) => (
          <li className="grid gap-3 py-7 md:grid-cols-[1fr_1.5fr]" key={source.localPath}>
            <div>
              <h2 className="font-display text-xl font-semibold">
                {source.vehicle} · {source.year}
              </h2>
              <p className="mt-1 text-sm text-muted">{source.generation}</p>
            </div>
            <div className="text-sm leading-7 text-muted">
              <p>Photographie : {source.author}</p>
              <p>{source.note}</p>
              <div className="mt-2 flex flex-wrap gap-x-5">
                <a className="min-h-11 py-2 text-ivory underline decoration-gold underline-offset-4" href={source.sourceUrl} rel="noreferrer" target="_blank">
                  Voir la source
                </a>
                <a className="min-h-11 py-2 text-ivory underline decoration-gold underline-offset-4" href={source.licenseUrl} rel="noreferrer" target="_blank">
                  {source.license}
                </a>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
