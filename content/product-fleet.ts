/** Historical catalogue snapshot. Public visibility is driven by `cars.active`, not this list. */
export const PUBLIC_FLEET_SLUGS = [
  "renault-clio-4",
  "opel-corsa",
  "peugeot-208",
  "citroen-c3",
  "vw-polo",
  "ford-fiesta",
  "toyota-yaris",
  "hyundai-i20",
  "dacia-sandero",
  "vw-golf",
  "renault-megane",
  "peugeot-308",
  "opel-astra",
  "citroen-c4",
  "toyota-corolla",
  "hyundai-i30",
  "seat-leon",
  "ford-focus",
  "mercedes-benz-classe-a",
  "audi-a3",
  "renault-megane-4",
  "renault-captur",
  "peugeot-2008",
  "volkswagen-t-cross",
  "volkswagen-t-roc",
  "hyundai-kona",
  "dacia-duster",
  "renault-talisman",
  "peugeot-508",
  "volkswagen-passat",
  "toyota-corolla-sedan",
  "hyundai-elantra",
  "honda-accord",
  "mercedes-benz-classe-c",
  "mercedes-classe-e",
  "renault-austral",
  "peugeot-3008",
  "opel-mokka",
  "volkswagen-tiguan",
  "seat-arona",
  "dacia-bigster",
  "hyundai-tucson",
  "kia-sportage",
  "ford-kuga",
] as const;

export const MINI_SLUGS = [
  "kia-picanto",
  "hyundai-i10",
  "fiat-500",
  "suzuki-swift",
] as const;

export const PUBLIC_YEAR_MINIMUM = 2021;

export function isPublicFleetSlug(slug: string) {
  return (PUBLIC_FLEET_SLUGS as readonly string[]).includes(slug);
}

export function isMiniSlug(slug: string) {
  return (MINI_SLUGS as readonly string[]).includes(slug);
}

export function hasListedPrice(price: number | null | undefined): price is number {
  return typeof price === "number" && Number.isFinite(price) && price > 0;
}

export function isYearReview(year: number) {
  return year < PUBLIC_YEAR_MINIMUM;
}
