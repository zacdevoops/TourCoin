export const PICKUP_LOCATIONS = [
  { slug: "casablanca-airport", label: "Aéroport Mohammed V" },
  { slug: "casablanca-centre", label: "Casablanca Centre" },
  { slug: "marrakech-airport", label: "Aéroport Marrakech Ménara" },
  { slug: "marrakech-gueliz", label: "Marrakech Guéliz" },
  { slug: "rabat-airport", label: "Aéroport Rabat-Salé" },
  { slug: "tanger-airport", label: "Aéroport Tanger Ibn Battouta" },
] as const;

export const BOOKING_LOCATIONS = [
  PICKUP_LOCATIONS[0].label,
  PICKUP_LOCATIONS[1].label,
  PICKUP_LOCATIONS[2].label,
  PICKUP_LOCATIONS[3].label,
  PICKUP_LOCATIONS[4].label,
  PICKUP_LOCATIONS[5].label,
] as const;

export type PickupLocationSlug = (typeof PICKUP_LOCATIONS)[number]["slug"];

export function isPickupLocationSlug(
  value: string | undefined,
): value is PickupLocationSlug {
  return PICKUP_LOCATIONS.some((location) => location.slug === value);
}

export const MAX_BOOKING_BODY_BYTES = 16 * 1024;
export const BOOKING_RATE_LIMIT = 8;
export const BOOKING_RATE_WINDOW_MS = 10 * 60 * 1000;
