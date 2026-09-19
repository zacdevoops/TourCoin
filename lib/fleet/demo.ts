import type { Car, CarCategory, CarSegment, FuelType, Transmission } from "@/types/domain";

type DemoSpec = {
  brand: string;
  model: string;
  category: CarCategory;
  segment: CarSegment | null;
  pricePerDay: number;
  fuel: FuelType;
  transmission: Transmission;
  year: 2021 | 2022 | 2023 | 2024 | 2025 | 2026;
  imageUrl: string;
};

const specs: DemoSpec[] = [
  { brand: "Peugeot", model: "208", category: "economique", segment: null, pricePerDay: 220, fuel: "essence", transmission: "manuelle", year: 2024, imageUrl: "/images/cars/tourcoin-vehicle-fallback.svg" },
  { brand: "Dacia", model: "Sandero", category: "economique", segment: null, pricePerDay: 220, fuel: "essence", transmission: "manuelle", year: 2023, imageUrl: "/images/cars/tourcoin-vehicle-fallback.svg" },
  { brand: "Toyota", model: "Corolla", category: "compacte", segment: "segment_c", pricePerDay: 540, fuel: "essence", transmission: "automatique", year: 2024, imageUrl: "/images/cars/tourcoin-vehicle-fallback.svg" },
  { brand: "Volkswagen", model: "Golf", category: "compacte", segment: "segment_c", pricePerDay: 520, fuel: "essence", transmission: "automatique", year: 2023, imageUrl: "/images/cars/tourcoin-vehicle-fallback.svg" },
  { brand: "Dacia", model: "Duster", category: "suv", segment: "suv_urbain", pricePerDay: 480, fuel: "essence", transmission: "manuelle", year: 2024, imageUrl: "/images/cars/tourcoin-vehicle-fallback.svg" },
  { brand: "Renault", model: "Captur", category: "suv", segment: "suv_urbain", pricePerDay: 420, fuel: "essence", transmission: "automatique", year: 2023, imageUrl: "/images/cars/tourcoin-vehicle-fallback.svg" },
  { brand: "Mercedes-Benz", model: "Classe C", category: "berline_routiere", segment: null, pricePerDay: 900, fuel: "essence", transmission: "automatique", year: 2024, imageUrl: "/images/cars/tourcoin-vehicle-fallback.svg" },
  { brand: "Hyundai", model: "Elantra", category: "berline_routiere", segment: null, pricePerDay: 480, fuel: "essence", transmission: "automatique", year: 2024, imageUrl: "/images/cars/tourcoin-vehicle-fallback.svg" },
  { brand: "Hyundai", model: "Tucson", category: "suv", segment: "suv_standard", pricePerDay: 480, fuel: "essence", transmission: "automatique", year: 2024, imageUrl: "/images/cars/tourcoin-vehicle-fallback.svg" },
];

export const demoCars: Car[] = specs.map(
  ({ brand, model, category, segment, pricePerDay, fuel, transmission, year, imageUrl }, index) => ({
    id: `00000000-0000-4000-8000-${String(index + 1).padStart(12, "0")}`,
    slug: `${brand}-${model}`
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, ""),
    brand,
    model,
    name: `${brand} ${model}`,
    year,
    category,
    segment,
    pricePerDay,
    currency: "MAD",
    fuel,
    transmission,
    seats: 5,
    doors: 5,
    description: `${brand} ${model}, soigneusement entretenue et idéale pour découvrir le Maroc avec confort. Assistance locale et kilométrage clair inclus.`,
    imageUrl,
    imagePath: null,
    active: true,
    featured: index < 3,
    sortOrder: index,
    createdAt: new Date(2026, 0, index + 1).toISOString(),
    updatedAt: new Date(2026, 0, index + 1).toISOString(),
  }),
);
