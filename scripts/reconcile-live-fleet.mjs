import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Dedicated Tourcoin Supabase credentials are required.");
}

const projectRef = new URL(supabaseUrl).hostname.split(".")[0];
if (projectRef !== "bymcdiukbibzlaxusrjf") {
  throw new Error("Refusing to reconcile: not the dedicated Tourcoin project.");
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const FALLBACK = "/images/cars/tourcoin-vehicle-fallback.svg";
const TARGETS = [
  {
    slug: "renault-clio-5",
    brand: "Renault",
    model: "Clio 5",
    name: "Renault Clio 5",
    year: 2024,
    category: "economique",
    fuel: "essence",
    transmission: "manuelle",
    seats: 5,
    doors: 5,
    featured: true,
    sort_order: 0,
    description:
      "Citadine Renault récente, soigneusement entretenue et idéale pour les trajets urbains au Maroc. Assistance locale et kilométrage clair inclus.",
  },
  {
    slug: "peugeot-208",
    brand: "Peugeot",
    model: "208",
    name: "Peugeot 208",
    year: 2024,
    category: "economique",
    fuel: "essence",
    transmission: "manuelle",
    seats: 5,
    doors: 5,
    featured: true,
    sort_order: 1,
    description:
      "Peugeot 208 récente, compacte et agréable à conduire pour découvrir le Maroc. Assistance locale et kilométrage clair inclus.",
  },
  {
    slug: "dacia-duster",
    brand: "Dacia",
    model: "Duster",
    name: "Dacia Duster",
    year: 2025,
    category: "suv",
    fuel: "essence",
    transmission: "manuelle",
    seats: 5,
    doors: 5,
    featured: false,
    sort_order: 2,
    description:
      "SUV Dacia Duster, polyvalent pour la ville et les routes du Maroc. Assistance locale et kilométrage clair inclus.",
  },
  {
    slug: "volkswagen-t-roc",
    brand: "Volkswagen",
    model: "T-Roc",
    name: "Volkswagen T-Roc",
    year: 2024,
    category: "suv",
    fuel: "essence",
    transmission: "automatique",
    seats: 5,
    doors: 5,
    featured: false,
    sort_order: 3,
    description:
      "SUV compact Volkswagen T-Roc, confortable pour les trajets urbains et les routes nationales. Assistance locale et kilométrage clair inclus.",
  },
  {
    slug: "hyundai-tucson",
    brand: "Hyundai",
    model: "Tucson",
    name: "Hyundai Tucson",
    year: 2024,
    category: "suv",
    fuel: "essence",
    transmission: "automatique",
    seats: 5,
    doors: 5,
    featured: true,
    sort_order: 4,
    description:
      "SUV Hyundai Tucson récent, spacieux et adapté aux voyages en famille au Maroc. Assistance locale et kilométrage clair inclus.",
  },
  {
    slug: "toyota-corolla",
    brand: "Toyota",
    model: "Corolla",
    name: "Toyota Corolla",
    year: 2024,
    category: "intermediaire",
    fuel: "essence",
    transmission: "automatique",
    seats: 5,
    doors: 4,
    featured: false,
    sort_order: 5,
    description:
      "Berline intermédiaire Toyota Corolla, pour les trajets réguliers au Maroc. Assistance locale et kilométrage clair inclus.",
  },
  {
    slug: "skoda-octavia",
    brand: "Skoda",
    model: "Octavia",
    name: "Skoda Octavia",
    year: 2024,
    category: "intermediaire",
    fuel: "essence",
    transmission: "automatique",
    seats: 5,
    doors: 5,
    featured: false,
    sort_order: 6,
    description:
      "Berline Skoda Octavia, confortable pour les longs trajets au Maroc. Assistance locale et kilométrage clair inclus.",
  },
  {
    slug: "mercedes-benz-classe-c",
    brand: "Mercedes-Benz",
    model: "Classe C",
    name: "Mercedes-Benz Classe C",
    year: 2024,
    category: "premium",
    fuel: "essence",
    transmission: "automatique",
    seats: 5,
    doors: 4,
    featured: true,
    sort_order: 7,
    description:
      "Berline premium Mercedes-Benz Classe C, pour une conduite élégante au Maroc. Assistance locale et kilométrage clair inclus.",
  },
  {
    slug: "bmw-serie-3",
    brand: "BMW",
    model: "Série 3",
    name: "BMW Série 3",
    year: 2023,
    category: "premium",
    fuel: "essence",
    transmission: "automatique",
    seats: 5,
    doors: 4,
    featured: false,
    sort_order: 8,
    description:
      "Berline premium BMW Série 3, précise et confortable pour les routes marocaines. Assistance locale et kilométrage clair inclus.",
  },
  {
    slug: "range-rover-evoque",
    brand: "Range Rover",
    model: "Evoque",
    name: "Range Rover Evoque",
    year: 2023,
    category: "premium",
    fuel: "essence",
    transmission: "automatique",
    seats: 5,
    doors: 5,
    featured: false,
    sort_order: 9,
    description:
      "SUV premium Range Rover Evoque, pour une présence affirmée sur la route. Assistance locale et kilométrage clair inclus.",
  },
];

function norm(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

function categoryFor(value) {
  const mapped = {
    mini: "economique",
    economy: "economique",
    economique: "economique",
    compact: "compacte",
    compacte: "compacte",
    citadine: "economique",
    intermediate: "intermediaire",
    intermediaire: "intermediaire",
    berline: "intermediaire",
    suv: "suv",
    premium: "premium",
  };
  return mapped[norm(value)] ?? "intermediaire";
}

function transmissionFor(value) {
  const mapped = {
    manual: "manuelle",
    manuelle: "manuelle",
    automatic: "automatique",
    automatique: "automatique",
  };
  return mapped[norm(value)] ?? "automatique";
}

function matchTarget(car) {
  const nBrand = norm(car.brand);
  const nModel = norm(car.model);
  const hits = TARGETS.filter((target) => {
    const slugHit = norm(car.slug) === target.slug;
    const exact = nBrand === norm(target.brand) && nModel === norm(target.model);
    const mercedes =
      target.slug === "mercedes-benz-classe-c" &&
      nBrand.includes("mercedes") &&
      nModel === "classe c";
    const vw =
      target.slug === "volkswagen-t-roc" &&
      (nBrand.includes("volkswagen") || nBrand === "vw") &&
      (nModel === "t-roc" || nModel === "troc");
    const bmw =
      target.slug === "bmw-serie-3" &&
      nBrand === "bmw" &&
      (nModel.includes("serie 3") || nModel.includes("3 series"));
    const skoda =
      target.slug === "skoda-octavia" &&
      nBrand.includes("skoda") &&
      nModel === "octavia";
    return slugHit || exact || mercedes || vw || bmw || skoda;
  });
  if (hits.length > 1) {
    throw new Error(`Ambiguous live match for ${car.slug}: ${hits.map((hit) => hit.slug).join(", ")}`);
  }
  return hits[0] ?? null;
}

function hasApprovedPrice(price) {
  return Number.isInteger(price) && price > 0;
}

async function must(result, context) {
  if (result.error) throw new Error(`${context}: ${result.error.message}`);
  return result.data;
}

const existing = await must(
  await supabase.from("cars").select("id,slug,brand,model,name,year,category,price_per_day,fuel,transmission,seats,doors,description,image_url,image_path,active,featured,sort_order"),
  "Unable to read live cars",
);

const matchedIds = new Set();
const created = [];
const normalized = [];
const deactivated = [];

for (const car of existing) {
  const target = matchTarget(car);
  if (!target) {
    const { error } = await supabase
      .from("cars")
      .update({
        active: false,
        featured: false,
        category: categoryFor(car.category),
        transmission: transmissionFor(car.transmission),
        image_url:
          typeof car.image_url === "string" && car.image_url.includes("/storage/v1/object/public/car-images/")
            ? car.image_url
            : FALLBACK,
        image_path:
          typeof car.image_path === "string" && car.image_path.endsWith("/main.webp")
            ? car.image_path
            : null,
      })
      .eq("id", car.id);
    if (error) throw new Error(`Unable to deactivate ${car.slug}: ${error.message}`);
    deactivated.push(car.slug);
    continue;
  }

  if (matchedIds.has(target.slug)) {
    throw new Error(`Multiple live records matched curated vehicle ${target.slug}`);
  }
  matchedIds.add(target.slug);

  const approvedPrice = hasApprovedPrice(car.price_per_day);
  const year = car.year >= 2023 && car.year <= 2026 ? car.year : target.year;
  const payload = {
    slug: target.slug,
    brand: target.brand,
    model: target.model,
    name: target.name,
    year,
    category: target.category,
    fuel: ["essence", "diesel", "hybride"].includes(car.fuel) ? car.fuel : target.fuel,
    transmission: target.transmission,
    seats: car.seats || target.seats,
    doors: car.doors || target.doors,
    description:
      typeof car.description === "string" && car.description.trim().length >= 20
        ? car.description.trim()
        : target.description,
    featured: approvedPrice ? target.featured : false,
    sort_order: target.sort_order,
    active: approvedPrice && year >= 2023,
  };
  if (car.slug !== target.slug || car.brand !== target.brand) normalized.push(`${car.slug} -> ${target.slug}`);
  const { error } = await supabase.from("cars").update(payload).eq("id", car.id);
  if (error) throw new Error(`Unable to update ${car.slug}: ${error.message}`);
}

for (const target of TARGETS) {
  if (matchedIds.has(target.slug)) continue;
  const { data, error } = await supabase
    .from("cars")
    .insert({
      slug: target.slug,
      brand: target.brand,
      model: target.model,
      name: target.name,
      year: target.year,
      category: target.category,
      price_per_day: null,
      currency: "MAD",
      fuel: target.fuel,
      transmission: target.transmission,
      seats: target.seats,
      doors: target.doors,
      description: target.description,
      image_url: FALLBACK,
      image_path: null,
      active: false,
      featured: false,
      sort_order: target.sort_order,
    })
    .select("id,slug")
    .single();
  if (error) throw new Error(`Unable to create ${target.slug}: ${error.message}`);
  created.push(data.slug);
}

console.info(
  JSON.stringify({
    projectRef,
    created,
    slugsNormalized: normalized,
    legacyDeactivated: deactivated.length,
    recordsRemoved: 0,
  }),
);
