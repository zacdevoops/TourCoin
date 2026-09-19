import "server-only";

import { createClient } from "@supabase/supabase-js";
import { demoCars } from "@/lib/fleet/demo";

export interface BookingCarOption {
  id: string;
  slug: string;
  name: string;
  pricePerDay: number;
  currency: string;
}

function developmentCars(): BookingCarOption[] {
  return demoCars
    .filter((car) => car.active)
    .map((car) => ({
      id: car.id,
      slug: car.slug,
      name: car.name,
      pricePerDay: car.pricePerDay,
      currency: car.currency,
    }));
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
    .select("id, slug, name, price_per_day, currency")
    .eq("active", true)
    .gt("price_per_day", 0)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error || !data) {
    return process.env.NODE_ENV === "development" ? developmentCars() : [];
  }

  return data.map((car) => ({
    id: car.id,
    slug: car.slug,
    name: car.name,
    pricePerDay: car.price_per_day,
    currency: car.currency,
  }));
}
