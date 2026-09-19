export const PRODUCT_CATEGORIES = [
  "economique",
  "compacte",
  "berline_routiere",
  "suv",
] as const;

export const LEGACY_CATEGORIES = ["intermediaire", "premium"] as const;

export const CAR_CATEGORIES = [
  ...PRODUCT_CATEGORIES,
  ...LEGACY_CATEGORIES,
] as const;

export const CAR_SEGMENTS = ["segment_c", "suv_urbain", "suv_standard"] as const;

export const FUEL_TYPES = ["essence", "diesel", "hybride"] as const;
export const TRANSMISSIONS = ["manuelle", "automatique"] as const;
export const BOOKING_STATUSES = [
  "NEW",
  "CONTACTED",
  "CONFIRMED",
  "CANCELLED",
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];
export type CarCategory = (typeof CAR_CATEGORIES)[number];
export type CarSegment = (typeof CAR_SEGMENTS)[number];
export type FuelType = (typeof FUEL_TYPES)[number];
export type Transmission = (typeof TRANSMISSIONS)[number];
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export const CAR_CATEGORY_LABELS: Record<CarCategory, string> = {
  economique: "Économique",
  compacte: "Compacte",
  berline_routiere: "Berlines / Routières",
  suv: "SUV / Crossovers",
  intermediaire: "Intermédiaire (historique)",
  premium: "Premium (historique)",
};

export const CATALOG_FILTERS = [
  {
    id: "economique",
    label: "Économique",
    category: "economique" as const,
    segment: undefined,
  },
  {
    id: "compacte",
    label: "Compacte",
    category: "compacte" as const,
    segment: undefined,
  },
  {
    id: "suv_urbain",
    label: "SUV urbains",
    category: undefined,
    segment: "suv_urbain" as const,
  },
  {
    id: "berline_routiere",
    label: "Berlines / Routières",
    category: "berline_routiere" as const,
    segment: undefined,
  },
  {
    id: "suv",
    label: "SUV / Crossovers",
    category: "suv" as const,
    segment: undefined,
  },
] as const;

export function isCarCategory(value: string | undefined): value is CarCategory {
  return typeof value === "string" && (CAR_CATEGORIES as readonly string[]).includes(value);
}

export function isProductCategory(value: string | undefined): value is ProductCategory {
  return typeof value === "string" && (PRODUCT_CATEGORIES as readonly string[]).includes(value);
}

export function isCarSegment(value: string | undefined): value is CarSegment {
  return typeof value === "string" && (CAR_SEGMENTS as readonly string[]).includes(value);
}

export function carCategoryLabel(category: string): string {
  return isCarCategory(category) ? CAR_CATEGORY_LABELS[category] : category;
}

export function carPublicLabel(car: Pick<Car, "category" | "segment">): string {
  if (car.segment === "suv_urbain") return "SUV urbains";
  return carCategoryLabel(car.category);
}

export interface Car {
  id: string;
  slug: string;
  brand: string;
  model: string;
  name: string;
  year: number;
  category: CarCategory;
  segment: CarSegment | null;
  pricePerDay: number;
  currency: "MAD";
  fuel: FuelType;
  transmission: Transmission;
  seats: number;
  doors: number;
  description: string;
  imageUrl: string;
  imagePath: string | null;
  active: boolean;
  featured: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface BookingRequest {
  id: string;
  status: BookingStatus;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  carId: string | null;
  carSlug: string;
  carName: string;
  carPricePerDay: number;
  currency: "MAD";
  pickupLocation: string;
  pickupAt: string;
  returnLocation: string;
  returnAt: string;
  message: string | null;
  createdAt: string;
  updatedAt: string;
}
