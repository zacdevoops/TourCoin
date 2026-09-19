import "server-only";
import { unstable_cache } from "next/cache";
import { PRODUCT_CATEGORIES, isProductCategory, type Car, type CarCategory, type CarSegment } from "@/types/domain";
import { createClient } from "@/lib/supabase/server";
import { demoCars } from "./demo";

type CarRow = {
  id: string; slug: string; brand: string; model: string; name: string;
  year: number; category: CarCategory; segment: CarSegment | null;
  price_per_day: number | null; currency: "MAD";
  fuel: Car["fuel"]; transmission: Car["transmission"]; seats: number; doors: number;
  description: string; image_url: string; image_path: string | null;
  active: boolean; featured: boolean; sort_order: number;
  created_at: string; updated_at: string;
};

export type FleetResult = { cars: Car[]; unavailable: boolean };
export type CatalogQuery = {
  q?: string;
  category?: string;
  segment?: string;
  fuel?: string;
  transmission?: string;
  sort?: string;
  page: number;
  pageSize?: number;
};
export type CatalogResult = FleetResult & { count: number };

const publicCategories = [...PRODUCT_CATEGORIES];

function isPubliclyComplete(row: CarRow) {
  return Boolean(
    row.id &&
      row.slug &&
      row.brand &&
      (row.model || row.name) &&
      isProductCategory(row.category) &&
      row.active,
  );
}

const mapCar = (row: CarRow): Car => ({
  id: row.id, slug: row.slug, brand: row.brand, model: row.model, name: row.name,
  year: row.year, category: row.category, segment: row.segment ?? null,
  pricePerDay: Number(row.price_per_day) > 0 ? Number(row.price_per_day) : 0,
  currency: row.currency, fuel: row.fuel, transmission: row.transmission,
  seats: row.seats, doors: row.doors, description: row.description,
  imageUrl: row.image_url, imagePath: row.image_path, active: row.active,
  featured: row.featured, sortOrder: row.sort_order, createdAt: row.created_at,
  updatedAt: row.updated_at,
});

async function readRows(): Promise<Car[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cars")
    .select("*")
    .eq("active", true)
    .in("category", publicCategories)
    .order("sort_order")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as CarRow[]).filter(isPubliclyComplete).map(mapCar);
}

async function readFleet(): Promise<FleetResult> {
  try {
    return { cars: await readRows(), unavailable: false };
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.warn("Using development fleet fallback:", error);
      return { cars: demoCars, unavailable: false };
    }
    console.error("Fleet query unavailable");
    return { cars: [], unavailable: true };
  }
}

export const getFleet = unstable_cache(readFleet, ["public-fleet-v12"], {
  revalidate: 300,
  tags: ["cars", "featured-cars"],
});

async function readCatalog({
  q,
  category,
  segment,
  fuel,
  transmission,
  sort,
  page,
  pageSize = 9,
}: CatalogQuery): Promise<CatalogResult> {
  try {
    const supabase = await createClient();
    let query = supabase
      .from("cars")
      .select("*", { count: "exact" })
      .eq("active", true)
      .in("category", publicCategories);

    if (segment === "suv_urbain") {
      query = query.eq("segment", "suv_urbain");
    } else if (isProductCategory(category)) {
      query = query.eq("category", category);
    } else {
      query = query.in("category", ["economique", "compacte", "berline_routiere", "suv"]);
    }

    if (fuel) query = query.eq("fuel", fuel);
    if (transmission) query = query.eq("transmission", transmission);
    if (q) {
      const safeSearch = q.replace(/[,%()]/g, " ").trim().slice(0, 80);
      if (safeSearch) {
        query = query.or(
          `brand.ilike.%${safeSearch}%,model.ilike.%${safeSearch}%,name.ilike.%${safeSearch}%`,
        );
      }
    }

    if (sort === "price-asc") {
      query = query.order("price_per_day", { ascending: true, nullsFirst: false });
    } else if (sort === "price-desc") {
      query = query.order("price_per_day", { ascending: false, nullsFirst: false });
    } else if (sort === "newest") {
      query = query.order("year", { ascending: false });
    } else {
      query = query
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });
    }

    const from = Math.max(0, page - 1) * pageSize;
    const { data, error, count } = await query.range(from, from + pageSize - 1);
    if (error) throw error;
    const cars = (data as CarRow[]).filter(isPubliclyComplete).map(mapCar);
    return {
      cars,
      count: count ?? 0,
      unavailable: false,
    };
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.warn("Using development catalog fallback:", error);
      const needle = q?.toLocaleLowerCase("fr");
      const filtered = demoCars.filter((car) => {
        const matchesSearch =
          !needle ||
          `${car.brand} ${car.model} ${car.name}`
            .toLocaleLowerCase("fr")
            .includes(needle);
        const matchesTaxonomy =
          segment === "suv_urbain"
            ? car.segment === "suv_urbain"
            : isProductCategory(category)
              ? car.category === category
              : isProductCategory(car.category);
        return (
          matchesSearch &&
          matchesTaxonomy &&
          (!fuel || car.fuel === fuel) &&
          (!transmission || car.transmission === transmission)
        );
      });
      if (sort === "price-asc") {
        filtered.sort((a, b) => (a.pricePerDay || Number.MAX_SAFE_INTEGER) - (b.pricePerDay || Number.MAX_SAFE_INTEGER));
      }
      if (sort === "price-desc") filtered.sort((a, b) => (b.pricePerDay || 0) - (a.pricePerDay || 0));
      if (sort === "newest") filtered.sort((a, b) => b.year - a.year);
      const from = Math.max(0, page - 1) * pageSize;
      return {
        cars: filtered.slice(from, from + pageSize),
        count: filtered.length,
        unavailable: false,
      };
    }
    console.error("Catalog query unavailable");
    return { cars: [], count: 0, unavailable: true };
  }
}

export const getCatalog = unstable_cache(readCatalog, ["public-catalog-v12"], {
  revalidate: 300,
  tags: ["cars"],
});

async function readCar(slug: string): Promise<{ car: Car | null; unavailable: boolean }> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("cars")
      .select("*")
      .eq("slug", slug)
      .eq("active", true)
      .maybeSingle();
    if (error) throw error;
    const row = data as CarRow | null;
    if (!row || !isPubliclyComplete(row)) return { car: null, unavailable: false };
    return { car: mapCar(row), unavailable: false };
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.warn("Using development car fallback:", error);
      return { car: demoCars.find((car) => car.slug === slug && car.active) ?? null, unavailable: false };
    }
    console.error("Car query unavailable");
    return { car: null, unavailable: true };
  }
}

export const getCar = unstable_cache(readCar, ["public-car-v12"], {
  revalidate: 300,
  tags: ["cars"],
});
