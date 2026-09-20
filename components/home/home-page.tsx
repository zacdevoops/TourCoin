import Image from "next/image";
import {
  ArrowRight,
  CalendarCheck,
  KeyRound,
  MapPin,
  MessageSquareText,
} from "lucide-react";
import Link from "next/link";

import { HomeSearch } from "@/components/home/home-search";
import { HOME_FAQS } from "@/content/home";
import { PICKUP_LOCATIONS } from "@/lib/booking/constants";
import { casablancaCalendarDate } from "@/lib/booking/datetime";

export function HomePage() {
  return (
    <>
      <section className="relative flex min-h-[78svh] items-end overflow-hidden bg-ink text-white sm:min-h-[84svh]">
        <Image
          preload
          src="/images/tourcoin-hero-v2.webp"
          alt="SUV premium face aux montagnes de l’Atlas près de Marrakech"
          fill
          sizes="100vw"
          quality={82}
          className="object-cover object-[69%_center]"
        />
        <div className="absolute inset-0 bg-black/45" />
        <div className="container-shell relative z-10 pb-28 pt-36 sm:pb-36">
          <p className="eyebrow">Location de voitures au Maroc</p>
          <h1 className="display-tight mt-5 max-w-[52rem] text-balance font-display text-5xl font-semibold sm:text-7xl lg:text-[5.25rem]">
            Le Maroc commence au volant.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-8 text-white/78 sm:text-lg">
            Des véhicules récents, un tarif expliqué et une équipe locale pour organiser votre départ.
          </p>
          <Link
            href="#availability"
            className="mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-sm bg-white px-6 text-sm font-extrabold text-charcoal transition-colors hover:bg-paper-muted"
          >
            Voir les disponibilités <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </section>

      <section id="availability" className="relative z-20 -mt-16 scroll-mt-24">
        <div className="container-shell">
          <HomeSearch today={casablancaCalendarDate()} />
        </div>
      </section>

      <section id="process" className="scroll-mt-20 border-y border-black/10 bg-white py-20 text-charcoal sm:py-28" aria-labelledby="process-title">
        <div className="container-shell">
          <div className="grid gap-12 lg:grid-cols-[0.7fr_1.3fr] lg:gap-24">
            <div>
              <SectionHeading eyebrow="Une réservation claire" title="Trois étapes, un seul interlocuteur" id="process-title" />
              <p className="mt-5 max-w-md leading-7 text-stone">
                Votre demande reste sans engagement jusqu’à la confirmation du véhicule, du tarif et des conditions.
              </p>
            </div>
            <ol className="border-t border-black/10">
              <Step icon={<CalendarCheck aria-hidden="true" />} number="01" title="Choisissez">
                Indiquez vos dates, votre lieu et le véhicule souhaité.
              </Step>
              <Step icon={<MessageSquareText aria-hidden="true" />} number="02" title="Nous confirmons">
                L’équipe vérifie la disponibilité et vous communique les conditions.
              </Step>
              <Step icon={<KeyRound aria-hidden="true" />} number="03" title="Vous partez">
                La remise du véhicule est organisée au point convenu.
              </Step>
            </ol>
          </div>
        </div>
      </section>

      <section className="bg-paper-muted py-20 text-charcoal sm:py-28">
        <div className="container-shell grid gap-16 lg:grid-cols-2 lg:gap-24">
          <div aria-labelledby="locations-title">
            <SectionHeading eyebrow="Prise en charge" title="Retrouvez-nous près de votre arrivée" id="locations-title" />
            <div className="mt-8 grid gap-x-8 sm:grid-cols-2">
              {PICKUP_LOCATIONS.map((location) => (
                <div key={location.slug} className="flex min-h-16 items-center gap-3 border-b border-black/10 py-4">
                  <MapPin className="size-4 shrink-0 text-gold" aria-hidden="true" />
                  <span className="text-sm font-semibold">{location.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div aria-labelledby="faq-title">
            <SectionHeading eyebrow="Informations utiles" title="Avant de réserver" id="faq-title" />
            <div className="mt-8 border-t border-black/10">
              {HOME_FAQS.slice(0, 4).map((item) => (
                <details key={item.question} className="group border-b border-black/10 py-4">
                  <summary className="flex min-h-10 cursor-pointer list-none items-center justify-between gap-5 text-sm font-bold marker:content-none">
                    {item.question}
                    <span className="text-xl font-light transition-transform group-open:rotate-45" aria-hidden="true">+</span>
                  </summary>
                  <p className="max-w-xl pb-2 pr-8 text-sm leading-6 text-stone">{item.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function SectionHeading({ eyebrow, title, id }: { eyebrow: string; title: string; id: string }) {
  return (
    <div>
      <p className="eyebrow">{eyebrow}</p>
      <h2 id={id} className="mt-3 max-w-3xl text-balance font-display text-4xl font-semibold leading-none sm:text-5xl">
        {title}
      </h2>
    </div>
  );
}

function Step({ icon, number, title, children }: { icon: React.ReactNode; number: string; title: string; children: React.ReactNode }) {
  return (
    <li className="grid gap-4 border-b border-black/10 py-7 sm:grid-cols-[3rem_2.5rem_1fr] sm:items-start">
      <span className="text-xs font-extrabold text-gold">{number}</span>
      <span className="text-charcoal">{icon}</span>
      <div>
        <h3 className="font-display text-2xl font-semibold">{title}</h3>
        <p className="mt-2 max-w-lg text-sm leading-6 text-stone">{children}</p>
      </div>
    </li>
  );
}
