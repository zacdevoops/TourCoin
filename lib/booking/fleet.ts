import "server-only";

import { createClient } from "@supabase/supabase-js";
import { demoCars } from "@/lib/fleet/demo";
import type { Car } from "@/types/domain";

export type BookingCarOption = Pick<
  Car,
  | "id"
  | "slug"
  | "brand"
  | "model"
  | "name"
  | "year"
  | "category"
  | "segment"
  | "pricePerDay"
  | "currency"
  | "fuel"
  | "transmission"
  | "seats"
  | "doors"
  | "description"
  | "imageUrl"
  | "imagePath"
>;

type BookingCarRow = {
  id: string;
  slug: string;
  brand: string;
  model: string;
  name: string;
  year: Car["year"];
  category: Car["category"];
  segment: Car["segment"];
  price_per_day: number;
  currency: Car["currency"];
  fuel: Car["fuel"];
  transmission: Car["transmission"];
  seats: number;
  doors: number;
  description: string;
  image_url: string;
  image_path: string | null;
};

function mapBookingCar(car: Car): BookingCarOption {
  return {
    id: car.id,
    slug: car.slug,
    brand: car.brand,
    model: car.model,
    name: car.name,
    year: car.year,
    category: car.category,
    segment: car.segment,
    pricePerDay: car.pricePerDay,
    currency: car.currency,
    fuel: car.fuel,
    transmission: car.transmission,
    seats: car.seats,
    doors: car.doors,
    description: car.description,
    imageUrl: car.imageUrl,
    imagePath: car.imagePath,
  };
}

function mapBookingRow(car: BookingCarRow): BookingCarOption {
  return {
    id: car.id,
    slug: car.slug,
    brand: car.brand,
    model: car.model,
    name: car.name,
    year: car.year,
    category: car.category,
    segment: car.segment,
    pricePerDay: car.price_per_day,
    currency: car.currency,
    fuel: car.fuel,
    transmission: car.transmission,
    seats: car.seats,
    doors: car.doors,
    description: car.description,
    imageUrl: car.image_url,
    imagePath: car.image_path,
  };
}

function developmentCars(): BookingCarOption[] {
  return demoCars
    .filter((car) => car.active)
    .filter((car) => car.pricePerDay > 0)
    .map(mapBookingCar);
}

export async function getActiveBookingCars(): Promise<BookingCarOption[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    return process.env.NODE_ENV === "development" ? developmentCars() : [];
  }

  const { data, error } = await createClient(url, anonKey, {
    auth: { persistSession: false },
  })
    .from("cars")
    .select(
      "id, slug, brand, model, name, year, category, segment, price_per_day, currency, fuel, transmission, seats, doors, description, image_url, image_path",
    )
    .eq("active", true)
    .gt("price_per_day", 0)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error || !data) {
    return process.env.NODE_ENV === "development" ? developmentCars() : [];
  }

  return (data as BookingCarRow[]).map(mapBookingRow);
}
