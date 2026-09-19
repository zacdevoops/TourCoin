import { createClient } from "@supabase/supabase-js";

const TOURCOIN_REF = "bymcdiukbibzlaxusrjf";
const FALLBACK = "/images/cars/tourcoin-vehicle-fallback.svg";
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Dedicated Tourcoin Supabase credentials are required.");
}
const projectRef = new URL(supabaseUrl).hostname.split(".")[0];
if (projectRef !== TOURCOIN_REF) {
  throw new Error("Refusing to run: not the dedicated Tourcoin project.");
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

function norm(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function must(result, context) {
  if (result.error) throw new Error(`${context}: ${result.error.message}`);
  return result.data;
}

const approved = [
  { slug: "renault-clio-4", brand: "Renault", model: "Clio 4", name: "Renault Clio 4", year: 2019, category: "economique", segment: null, price: null, fuel: "essence", transmission: "manuelle", seats: 5, doors: 5, sort: 10, yearReview: true },
  { slug: "opel-corsa", brand: "Opel", model: "Corsa", name: "Opel Corsa", year: 2024, category: "economique", segment: null, price: null, fuel: "essence", transmission: "manuelle", seats: 5, doors: 5, sort: 11 },
  { slug: "peugeot-208", brand: "Peugeot", model: "208", name: "Peugeot 208", year: 2024, category: "economique", segment: null, price: 220, fuel: "essence", transmission: "manuelle", seats: 5, doors: 5, sort: 12, adilcarPrice: true },
  { slug: "citroen-c3", brand: "Citroën", model: "C3", name: "Citroën C3", year: 2023, category: "economique", segment: null, price: 250, fuel: "essence", transmission: "manuelle", seats: 5, doors: 5, sort: 13, adilcarPrice: true },
  { slug: "vw-polo", brand: "Volkswagen", model: "Polo", name: "Volkswagen Polo", year: 2023, category: "economique", segment: null, price: 250, fuel: "essence", transmission: "automatique", seats: 5, doors: 5, sort: 14, adilcarPrice: true, aliases: ["volkswagen polo"] },
  { slug: "ford-fiesta", brand: "Ford", model: "Fiesta", name: "Ford Fiesta", year: 2023, category: "economique", segment: null, price: null, fuel: "essence", transmission: "manuelle", seats: 5, doors: 5, sort: 15 },
  { slug: "toyota-yaris", brand: "Toyota", model: "Yaris", name: "Toyota Yaris", year: 2023, category: "economique", segment: null, price: 260, fuel: "essence", transmission: "automatique", seats: 5, doors: 5, sort: 16, adilcarPrice: true },
  { slug: "hyundai-i20", brand: "Hyundai", model: "i20", name: "Hyundai i20", year: 2023, category: "economique", segment: null, price: 240, fuel: "essence", transmission: "manuelle", seats: 5, doors: 5, sort: 17, adilcarPrice: true },
  { slug: "dacia-sandero", brand: "Dacia", model: "Sandero", name: "Dacia Sandero", year: 2023, category: "economique", segment: null, price: 220, fuel: "essence", transmission: "manuelle", seats: 5, doors: 5, sort: 18, adilcarPrice: true },
  { slug: "vw-golf", brand: "Volkswagen", model: "Golf", name: "Volkswagen Golf", year: 2023, category: "compacte", segment: "segment_c", price: null, fuel: "essence", transmission: "automatique", seats: 5, doors: 5, sort: 20, aliases: ["volkswagen golf"] },
  { slug: "renault-megane", brand: "Renault", model: "Mégane", name: "Renault Mégane", year: 2024, category: "compacte", segment: "segment_c", price: null, fuel: "essence", transmission: "automatique", seats: 5, doors: 5, sort: 21 },
  { slug: "peugeot-308", brand: "Peugeot", model: "308", name: "Peugeot 308", year: 2023, category: "compacte", segment: "segment_c", price: null, fuel: "essence", transmission: "automatique", seats: 5, doors: 5, sort: 22 },
  { slug: "opel-astra", brand: "Opel", model: "Astra", name: "Opel Astra", year: 2023, category: "compacte", segment: "segment_c", price: null, fuel: "essence", transmission: "automatique", seats: 5, doors: 5, sort: 23 },
  { slug: "citroen-c4", brand: "Citroën", model: "C4", name: "Citroën C4", year: 2023, category: "compacte", segment: "segment_c", price: null, fuel: "essence", transmission: "automatique", seats: 5, doors: 5, sort: 24 },
  { slug: "toyota-corolla", brand: "Toyota", model: "Corolla", name: "Toyota Corolla", year: 2024, category: "compacte", segment: "segment_c", price: null, fuel: "essence", transmission: "automatique", seats: 5, doors: 5, sort: 25 },
  { slug: "hyundai-i30", brand: "Hyundai", model: "i30", name: "Hyundai i30", year: 2024, category: "compacte", segment: "segment_c", price: null, fuel: "essence", transmission: "automatique", seats: 5, doors: 5, sort: 26 },
  { slug: "seat-leon", brand: "SEAT", model: "Leon", name: "SEAT Leon", year: 2024, category: "compacte", segment: "segment_c", price: null, fuel: "essence", transmission: "automatique", seats: 5, doors: 5, sort: 27 },
  { slug: "ford-focus", brand: "Ford", model: "Focus", name: "Ford Focus", year: 2024, category: "compacte", segment: "segment_c", price: null, fuel: "essence", transmission: "automatique", seats: 5, doors: 5, sort: 28 },
  { slug: "mercedes-benz-classe-a", brand: "Mercedes-Benz", model: "Classe A", name: "Mercedes-Benz Classe A", year: 2024, category: "compacte", segment: "segment_c", price: null, fuel: "essence", transmission: "automatique", seats: 5, doors: 5, sort: 29 },
  { slug: "audi-a3", brand: "Audi", model: "A3", name: "Audi A3", year: 2024, category: "compacte", segment: "segment_c", price: null, fuel: "essence", transmission: "automatique", seats: 5, doors: 5, sort: 30, keepExistingPrice: true },
  { slug: "renault-megane-4", brand: "Renault", model: "Mégane 4", name: "Renault Mégane 4", year: 2022, category: "compacte", segment: "segment_c", price: null, fuel: "essence", transmission: "automatique", seats: 5, doors: 5, sort: 31 },
  { slug: "renault-captur", brand: "Renault", model: "Captur", name: "Renault Captur", year: 2023, category: "suv", segment: "suv_urbain", price: null, fuel: "essence", transmission: "automatique", seats: 5, doors: 5, sort: 40 },
  { slug: "peugeot-2008", brand: "Peugeot", model: "2008", name: "Peugeot 2008", year: 2023, category: "suv", segment: "suv_urbain", price: null, fuel: "essence", transmission: "automatique", seats: 5, doors: 5, sort: 41 },
  { slug: "volkswagen-t-cross", brand: "Volkswagen", model: "T-Cross", name: "Volkswagen T-Cross", year: 2024, category: "suv", segment: "suv_urbain", price: null, fuel: "essence", transmission: "automatique", seats: 5, doors: 5, sort: 42 },
  { slug: "volkswagen-t-roc", brand: "Volkswagen", model: "T-Roc", name: "Volkswagen T-Roc", year: 2024, category: "suv", segment: "suv_urbain", price: null, fuel: "essence", transmission: "automatique", seats: 5, doors: 5, sort: 43 },
  { slug: "hyundai-kona", brand: "Hyundai", model: "Kona", name: "Hyundai Kona", year: 2024, category: "suv", segment: "suv_urbain", price: null, fuel: "essence", transmission: "automatique", seats: 5, doors: 5, sort: 44 },
  { slug: "dacia-duster", brand: "Dacia", model: "Duster", name: "Dacia Duster", year: 2023, category: "suv", segment: "suv_urbain", price: null, fuel: "essence", transmission: "manuelle", seats: 5, doors: 5, sort: 45 },
  { slug: "renault-talisman", brand: "Renault", model: "Talisman", name: "Renault Talisman", year: 2022, category: "berline_routiere", segment: null, price: null, fuel: "essence", transmission: "automatique", seats: 5, doors: 4, sort: 70 },
  { slug: "peugeot-508", brand: "Peugeot", model: "508", name: "Peugeot 508", year: 2024, category: "berline_routiere", segment: null, price: null, fuel: "essence", transmission: "automatique", seats: 5, doors: 4, sort: 71 },
  { slug: "volkswagen-passat", brand: "Volkswagen", model: "Passat", name: "Volkswagen Passat", year: 2024, category: "berline_routiere", segment: null, price: null, fuel: "essence", transmission: "automatique", seats: 5, doors: 4, sort: 72 },
  { slug: "toyota-corolla-sedan", brand: "Toyota", model: "Corolla Sedan", name: "Toyota Corolla Sedan", year: 2024, category: "berline_routiere", segment: null, price: null, fuel: "essence", transmission: "automatique", seats: 5, doors: 4, sort: 73 },
  { slug: "hyundai-elantra", brand: "Hyundai", model: "Elantra", name: "Hyundai Elantra", year: 2024, category: "berline_routiere", segment: null, price: null, fuel: "essence", transmission: "automatique", seats: 5, doors: 4, sort: 74 },
  { slug: "honda-accord", brand: "Honda", model: "Accord", name: "Honda Accord", year: 2024, category: "berline_routiere", segment: null, price: null, fuel: "essence", transmission: "automatique", seats: 5, doors: 4, sort: 75 },
  { slug: "mercedes-benz-classe-c", brand: "Mercedes-Benz", model: "Classe C", name: "Mercedes-Benz Classe C", year: 2024, category: "berline_routiere", segment: null, price: 900, fuel: "essence", transmission: "automatique", seats: 5, doors: 4, sort: 76, adilcarPrice: true, aliases: ["mercedes classe c"] },
  { slug: "mercedes-classe-e", brand: "Mercedes-Benz", model: "Classe E", name: "Mercedes-Benz Classe E", year: 2023, category: "berline_routiere", segment: null, price: null, fuel: "essence", transmission: "automatique", seats: 5, doors: 4, sort: 77, aliases: ["mercedes classe e"] },
  { slug: "renault-austral", brand: "Renault", model: "Austral", name: "Renault Austral", year: 2024, category: "suv", segment: "suv_standard", price: null, fuel: "essence", transmission: "automatique", seats: 5, doors: 5, sort: 50 },
  { slug: "peugeot-3008", brand: "Peugeot", model: "3008", name: "Peugeot 3008", year: 2024, category: "suv", segment: "suv_standard", price: null, fuel: "essence", transmission: "automatique", seats: 5, doors: 5, sort: 51 },
  { slug: "opel-mokka", brand: "Opel", model: "Mokka", name: "Opel Mokka", year: 2024, category: "suv", segment: "suv_standard", price: null, fuel: "essence", transmission: "automatique", seats: 5, doors: 5, sort: 52 },
  { slug: "volkswagen-tiguan", brand: "Volkswagen", model: "Tiguan", name: "Volkswagen Tiguan", year: 2024, category: "suv", segment: "suv_standard", price: null, fuel: "essence", transmission: "automatique", seats: 5, doors: 5, sort: 53 },
  { slug: "seat-arona", brand: "SEAT", model: "Arona", name: "SEAT Arona", year: 2024, category: "suv", segment: "suv_standard", price: null, fuel: "essence", transmission: "automatique", seats: 5, doors: 5, sort: 54 },
  { slug: "dacia-bigster", brand: "Dacia", model: "Bigster", name: "Dacia Bigster", year: 2025, category: "suv", segment: "suv_standard", price: null, fuel: "essence", transmission: "automatique", seats: 5, doors: 5, sort: 55 },
  { slug: "hyundai-tucson", brand: "Hyundai", model: "Tucson", name: "Hyundai Tucson", year: 2024, category: "suv", segment: "suv_standard", price: 480, fuel: "essence", transmission: "automatique", seats: 5, doors: 5, sort: 56, adilcarPrice: true },
  { slug: "kia-sportage", brand: "Kia", model: "Sportage", name: "Kia Sportage", year: 2025, category: "suv", segment: "suv_standard", price: null, fuel: "hybride", transmission: "automatique", seats: 5, doors: 5, sort: 57, keepExistingPrice: true },
  { slug: "ford-kuga", brand: "Ford", model: "Kuga", name: "Ford Kuga", year: 2024, category: "suv", segment: "suv_standard", price: null, fuel: "essence", transmission: "automatique", seats: 5, doors: 5, sort: 58 },
];

function identityKeys(car) {
  const keys = new Set([`${norm(car.brand)} ${norm(car.model)}`]);
  for (const alias of car.aliases ?? []) keys.add(norm(alias));
  return keys;
}

function hasTourcoinPhoto(row) {
  const url = String(row.image_url ?? "");
  const path = String(row.image_path ?? "");
  return (
    url.includes("/storage/v1/object/public/car-images/") &&
    (path.endsWith(".webp") || url.includes(".webp"))
  );
}

function descriptionFor(car) {
  return `${car.brand} ${car.model}, soigneusement entretenue et proposée à la location au Maroc. Assistance locale et conditions claires avant le départ.`;
}

function findMatch(target, live) {
  const bySlug = live.find((row) => row.slug === target.slug);
  if (bySlug) return bySlug;
  const keys = identityKeys(target);
  const matches = live.filter((row) => keys.has(`${norm(row.brand)} ${norm(row.model)}`));
  if (matches.length === 1) return matches[0];
  if (matches.length > 1) {
    throw new Error(`Duplicate identity for ${target.slug}: ${matches.map((row) => row.slug).join(", ")}`);
  }
  return null;
}

const live = must(
  await supabase
    .from("cars")
    .select("id,slug,brand,model,name,year,category,segment,price_per_day,fuel,transmission,seats,doors,description,image_url,image_path,active,featured,sort_order")
    .order("slug"),
  "Unable to read live cars",
);

const claimed = new Set();
const created = [];
const updated = [];
const unmatchedLive = [];

for (const target of approved) {
  const row = findMatch(target, live);
  if (row) {
    if (claimed.has(row.id)) throw new Error(`Row ${row.slug} claimed twice`);
    claimed.add(row.id);
    const nextPrice = target.adilcarPrice
      ? target.price
      : target.keepExistingPrice && Number(row.price_per_day) > 0
        ? row.price_per_day
        : target.price;
    const photoOk = hasTourcoinPhoto(row);
    const canActivate = Boolean(
      !target.yearReview &&
      target.year >= 2021 &&
      target.year <= 2026 &&
      target.adilcarPrice &&
      Number(nextPrice) > 0 &&
      photoOk,
    );
    const payload = {
      slug: target.slug,
      brand: target.brand,
      model: target.model,
      name: target.name,
      year: target.year,
      category: target.category,
      segment: target.segment,
      price_per_day: nextPrice,
      fuel: row.fuel || target.fuel,
      transmission: row.transmission || target.transmission,
      seats: row.seats || target.seats,
      doors: row.doors || target.doors,
      description: row.description && row.description.length >= 20 ? row.description : descriptionFor(target),
      sort_order: target.sort,
      active: canActivate,
      featured: canActivate,
    };
    must(
      await supabase.from("cars").update(payload).eq("id", row.id),
      `update ${target.slug}`,
    );
    updated.push({ slug: target.slug, id: row.id, active: canActivate, photoOk });
  } else {
    const payload = {
      slug: target.slug,
      brand: target.brand,
      model: target.model,
      name: target.name,
      year: target.year,
      category: target.category,
      segment: target.segment,
      price_per_day: target.price,
      currency: "MAD",
      fuel: target.fuel,
      transmission: target.transmission,
      seats: target.seats,
      doors: target.doors,
      description: descriptionFor(target),
      image_url: FALLBACK,
      image_path: null,
      sort_order: target.sort,
      active: false,
      featured: false,
    };
    const inserted = must(
      await supabase.from("cars").insert(payload).select("id,slug").single(),
      `insert ${target.slug}`,
    );
    created.push(inserted);
  }
}

for (const row of live) {
  if (claimed.has(row.id)) continue;
  unmatchedLive.push(row.slug);
  must(
    await supabase
      .from("cars")
      .update({ active: false, featured: false, sort_order: 900 })
      .eq("id", row.id),
    `deactivate ${row.slug}`,
  );
}

const after = must(
  await supabase
    .from("cars")
    .select("slug,brand,model,year,category,segment,price_per_day,active,featured,image_url")
    .order("sort_order")
    .order("slug"),
  "reload",
);

const active = after.filter((row) => row.active);
const byCat = {};
for (const row of after.filter((row) =>
  ["economique", "compacte", "berline_routiere", "suv"].includes(row.category),
)) {
  const key = row.segment === "suv_urbain" ? "suv_urbain" : row.category;
  byCat[key] = (byCat[key] || 0) + 1;
}

console.log(JSON.stringify({
  required: approved.length,
  updated: updated.length,
  created: created.map((row) => row.slug),
  deactivated_not_in_list: unmatchedLive,
  active: active.map((row) => row.slug),
  counts_all_approved_rows: byCat,
}, null, 2));
