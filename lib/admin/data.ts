import type { SupabaseClient } from "@supabase/supabase-js";
import type { BookingRequest, Car } from "@/types/domain";

type CarRow = {
  id: string;
  slug: string;
  brand: string;
  model: string;
  name: string;
  year: number;
  category: Car["category"];
  segment: Car["segment"];
  price_per_day: number | null;
  currency: "MAD";
  fuel: Car["fuel"];
  transmission: Car["transmission"];
  seats: number;
  doors: number;
  description: string;
  image_url: string;
  image_path: string | null;
  active: boolean;
  featured: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

type BookingRow = {
  id: string;
  status: BookingRequest["status"];
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  car_id: string | null;
  car_slug: string;
  car_name: string;
  car_price_per_day: number;
  currency: "MAD";
  pickup_location: string;
  pickup_at: string;
  return_location: string;
  return_at: string;
  message: string | null;
  created_at: string;
  updated_at: string;
};

const CAR_COLUMNS =
  "id,slug,brand,model,name,year,category,segment,price_per_day,currency,fuel,transmission,seats,doors,description,image_url,image_path,active,featured,sort_order,created_at,updated_at";
const BOOKING_COLUMNS =
  "id,status,customer_name,customer_email,customer_phone,car_id,car_slug,car_name,car_price_per_day,currency,pickup_location,pickup_at,return_location,return_at,message,created_at,updated_at";

function mapCar(row: CarRow): Car {
  return {
    id: row.id,
    slug: row.slug,
    brand: row.brand,
    model: row.model,
    name: row.name,
    year: row.year,
    category: row.category,
    segment: row.segment ?? null,
    pricePerDay: row.price_per_day ?? 0,
    currency: row.currency,
    fuel: row.fuel,
    transmission: row.transmission,
    seats: row.seats,
    doors: row.doors,
    description: row.description,
    imageUrl: row.image_url,
    imagePath: row.image_path,
    active: row.active,
    featured: row.featured,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapBooking(row: BookingRow): BookingRequest {
  return {
    id: row.id,
    status: row.status,
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    customerPhone: row.customer_phone,
    carId: row.car_id,
    carSlug: row.car_slug,
    carName: row.car_name,
    carPricePerDay: row.car_price_per_day,
    currency: row.currency,
    pickupLocation: row.pickup_location,
    pickupAt: row.pickup_at,
    returnLocation: row.return_location,
    returnAt: row.return_at,
    message: row.message,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getCars(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("cars")
    .select(CAR_COLUMNS)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  return {
    cars: error ? [] : ((data ?? []) as CarRow[]).map(mapCar),
    error: error ? "Impossible de charger les véhicules." : null,
  };
}

export async function getCar(supabase: SupabaseClient, id: string) {
  const { data, error } = await supabase
    .from("cars")
    .select(CAR_COLUMNS)
    .eq("id", id)
    .maybeSingle();

  return {
    car: data ? mapCar(data as CarRow) : null,
    error: error ? "Impossible de charger ce véhicule." : null,
  };
}

export async function getBookings(
  supabase: SupabaseClient,
  limit?: number,
) {
  let query = supabase
    .from("booking_requests")
    .select(BOOKING_COLUMNS)
    .order("created_at", { ascending: false });
  if (limit) query = query.limit(limit);
  const { data, error } = await query;

  return {
    bookings: error ? [] : ((data ?? []) as BookingRow[]).map(mapBooking),
    error: error ? "Impossible de charger les demandes." : null,
  };
}

export async function getDashboardData(supabase: SupabaseClient) {
  const [total, active, inactive, featured, recent] = await Promise.all([
    supabase.from("cars").select("*", { count: "exact", head: true }),
    supabase
      .from("cars")
      .select("*", { count: "exact", head: true })
      .eq("active", true),
    supabase
      .from("cars")
      .select("*", { count: "exact", head: true })
      .eq("active", false),
    supabase
      .from("cars")
      .select("*", { count: "exact", head: true })
      .eq("featured", true),
    getBookings(supabase, 6),
  ]);

  const failed = [total, active, inactive, featured].some(
    (result) => result.error,
  );

  return {
    counts: {
      total: total.count ?? 0,
      active: active.count ?? 0,
      inactive: inactive.count ?? 0,
      featured: featured.count ?? 0,
    },
    recentBookings: recent.bookings,
    error:
      failed || recent.error
        ? "Certaines données du tableau de bord n’ont pas pu être chargées."
        : null,
  };
}
