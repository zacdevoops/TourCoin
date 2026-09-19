import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, Clock3, MapPin, ShieldCheck } from "lucide-react";
import { PICKUP_LOCATIONS } from "@/lib/booking/constants";
import { casablancaCalendarDate } from "@/lib/booking/datetime";
import { CATALOG_FILTERS, type Car } from "@/types/domain";
import { CarCard } from "@/components/cars/car-card";
import { HomeSearch } from "@/components/home/home-search";
import { ButtonLink } from "@/components/ui/button-link";

export function HomePage({ cars, unavailable }: { cars: Car[]; unavailable: boolean }) {
  return (
    <>
      <section className="relative flex min-h-[100svh] items-end">
        <Image priority src="/images/tourcoin-hero.jpg" alt="Voiture de prestige sur une route panoramique" fill sizes="100vw" quality={82} className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/55 to-ink/20" />
        <div className="container-shell relative z-10 pb-24 pt-36 md:pb-32">
          <p className="eyebrow">Votre route. Notre exigence.</p>
          <h1 className="mt-5 max-w-4xl text-balance font-display text-5xl font-semibold leading-[1.02] tracking-tight sm:text-6xl lg:text-8xl">Le Maroc, au volant de l’exception.</h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-ivory/75">Une flotte choisie avec soin, une réservation simple et une assistance locale disponible tout au long du voyage.</p>
          <div className="mt-9 flex flex-wrap gap-3"><ButtonLink href="/cars">Découvrir la flotte</ButtonLink><ButtonLink href="/contact" variant="outline">Parler à un conseiller</ButtonLink></div>
        </div>
      </section>

      <section className="relative z-20 -mt-10">
        <div className="container-shell">
          <HomeSearch today={casablancaCalendarDate()} />
        </div>
      </section>

      <section className="container-shell section-space" aria-labelledby="featured-title">
        <SectionHeading eyebrow="Sélection Tourcoin" title="Des voitures qui donnent le ton" id="featured-title" />
        {unavailable ? <Unavailable /> : <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">{cars.slice(0, 3).map((car) => <CarCard car={car} key={car.id} />)}</div>}
        <div className="mt-10 text-center"><ButtonLink href="/cars" variant="outline">Voir toute la flotte</ButtonLink></div>
      </section>

      <section className="border-y border-line bg-surface section-space" aria-labelledby="categories-title">
        <div className="container-shell"><SectionHeading eyebrow="À chaque voyage" title="Choisissez votre allure" id="categories-title" />
          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">{CATALOG_FILTERS.map((filter) => {
            const href = filter.segment ? `/cars?segment=${filter.segment}` : `/cars?category=${filter.category}`;
            return <Link key={filter.id} href={href} className="flex min-h-32 items-end rounded-md border border-line bg-surface-raised p-5 font-display text-lg font-semibold hover:border-gold">{filter.label}</Link>;
          })}</div>
        </div>
      </section>

      <section className="container-shell section-space" aria-labelledby="why-title">
        <SectionHeading eyebrow="La différence Tourcoin" title="La sérénité, sans détour" id="why-title" />
        <div className="mt-10 grid gap-8 md:grid-cols-3"><Feature icon={<ShieldCheck />} title="Flotte contrôlée">Chaque véhicule est vérifié et préparé avant sa remise.</Feature><Feature icon={<CheckCircle2 />} title="Prix transparents">Des conditions claires, expliquées avant votre départ.</Feature><Feature icon={<Clock3 />} title="Assistance locale">Une équipe joignable pour vous accompagner sur la route.</Feature></div>
      </section>

      <section className="border-y border-line bg-surface section-space" aria-labelledby="how-title">
        <div className="container-shell"><SectionHeading eyebrow="Simple par nature" title="Trois étapes, et vous partez" id="how-title" />
          <ol className="mt-10 grid gap-8 md:grid-cols-3">{["Choisissez votre voiture", "Confirmez avec notre équipe", "Prenez la route"].map((text, index) => <li key={text} className="border-t border-line pt-6"><span className="font-display text-4xl text-gold">0{index + 1}</span><h3 className="mt-4 font-display text-xl font-semibold">{text}</h3></li>)}</ol>
        </div>
      </section>

      <section className="container-shell section-space" aria-labelledby="locations-title">
        <SectionHeading eyebrow="Au plus près de vous" title="Nos points de départ" id="locations-title" />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{PICKUP_LOCATIONS.map((location) => <div key={location.slug} className="flex min-h-28 items-center gap-4 rounded-md border border-line p-5"><MapPin className="shrink-0 text-gold" aria-hidden="true" /><span className="font-display text-lg font-semibold sm:text-xl">{location.label}</span></div>)}</div>
      </section>

      <section className="bg-gold py-20 text-ink">
        <div className="container-shell flex flex-col items-start justify-between gap-8 md:flex-row md:items-center"><div><p className="text-xs font-bold uppercase tracking-[.16em]">Le voyage commence ici</p><h2 className="mt-3 max-w-2xl font-display text-4xl font-semibold sm:text-5xl">Votre prochaine route vous attend.</h2></div><Link href="/cars" className="inline-flex min-h-12 items-center rounded-sm bg-ink px-7 font-bold text-ivory hover:bg-surface">Choisir ma voiture</Link></div>
      </section>
    </>
  );
}

function SectionHeading({ eyebrow, title, id }: { eyebrow: string; title: string; id: string }) { return <div><p className="eyebrow">{eyebrow}</p><h2 id={id} className="mt-4 max-w-3xl text-balance font-display text-3xl font-semibold sm:text-5xl">{title}</h2></div>; }
function Feature({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) { return <div><span className="flex size-12 items-center justify-center rounded-full border border-gold text-gold">{icon}</span><h3 className="mt-5 font-display text-xl font-semibold">{title}</h3><p className="mt-3 leading-7 text-muted">{children}</p></div>; }
function Unavailable() { return <div className="mt-10 rounded-md border border-line bg-surface p-8 text-muted">Notre catalogue est momentanément indisponible. Contactez-nous pour connaître les véhicules disponibles.</div>; }
