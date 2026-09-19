import { readFile } from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const realImages = [
  { slug: "renault-clio-5", brand: "Renault", model: "Clio 5", filename: "renault-clio-5-2024.webp" },
  { slug: "dacia-duster", brand: "Dacia", model: "Duster", filename: "dacia-duster-2025.webp" },
  { slug: "peugeot-208", brand: "Peugeot", model: "208", filename: "peugeot-208-2024.webp" },
  { slug: "volkswagen-t-roc", brand: "Volkswagen", model: "T-Roc", filename: "volkswagen-t-roc-2024.webp" },
  { slug: "mercedes-benz-classe-c", brand: "Mercedes-Benz", model: "Classe C", filename: "mercedes-classe-c-2024.webp" },
  { slug: "range-rover-evoque", brand: "Range Rover", model: "Evoque", filename: "range-rover-evoque-2023.webp" },
  { slug: "hyundai-tucson", brand: "Hyundai", model: "Tucson", filename: "hyundai-tucson-2024.webp" },
  { slug: "bmw-serie-3", brand: "BMW", model: "Série 3", filename: "bmw-serie-3-2023.webp" },
];
const fallbackImages = [
  { slug: "skoda-octavia", brand: "Skoda", model: "Octavia" },
  { slug: "toyota-corolla", brand: "Toyota", model: "Corolla" },
];

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

if (!supabaseUrl || !serviceRoleKey || !siteUrl) {
  throw new Error(
    "NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SITE_URL are required.",
  );
}
if (!siteUrl.startsWith("https://")) {
  throw new Error("NEXT_PUBLIC_SITE_URL must use HTTPS before fleet synchronization.");
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

function normalized(value) {
  return value.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().trim();
}

async function carForTarget(target) {
  const { data, error } = await supabase
    .from("cars")
    .select("id, slug, brand, model, image_path")
    .eq("slug", target.slug);
  if (error) throw new Error(`Unable to read car record: ${target.slug}`);
  if (!data || data.length !== 1) return null;
  const car = data[0];
  if (
    normalized(car.brand) !== normalized(target.brand) ||
    normalized(car.model) !== normalized(target.model)
  ) {
    return null;
  }
  return car;
}

async function matchedTargets(targets) {
  const matches = [];
  const skipped = [];
  for (const target of targets) {
    const car = await carForTarget(target);
    if (car) matches.push({ target, car });
    else skipped.push(target.slug);
  }
  return { matches, skipped };
}

function reportSkipped(slugs) {
  for (const slug of slugs) {
    console.warn(`Skipped unmatched fleet image: ${slug}`);
  }
}

async function verifyObject(objectPath) {
  const separator = objectPath.lastIndexOf("/");
  const folder = objectPath.slice(0, separator);
  const filename = objectPath.slice(separator + 1);
  const { data, error } = await supabase.storage
    .from("car-images")
    .list(folder, { search: filename, limit: 10 });
  if (error || !data?.some((object) => object.name === filename)) {
    throw new Error(`Uploaded object verification failed: ${objectPath}`);
  }
}

async function updateRecord(car, imageUrl, imagePath) {
  const { error } = await supabase
    .from("cars")
    .update({ image_url: imageUrl, image_path: imagePath })
    .eq("id", car.id);
  if (error) throw new Error(`Unable to update car image: ${car.slug}`);

  if (car.image_path && car.image_path !== imagePath) {
    await supabase.storage.from("car-images").remove([car.image_path]);
  }
}

const realTargets = await matchedTargets(realImages);
const fallbackTargets = await matchedTargets(fallbackImages);
reportSkipped([...realTargets.skipped, ...fallbackTargets.skipped]);

for (const { target, car } of realTargets.matches) {
  const objectPath = `${car.id}/main.webp`;
  const bytes = await readFile(
    path.join(process.cwd(), "public", "images", "cars", target.filename),
  );
  const { error: uploadError } = await supabase.storage
    .from("car-images")
    .upload(objectPath, bytes, {
      contentType: "image/webp",
      cacheControl: "3600",
      upsert: true,
    });
  if (uploadError) throw new Error(`Unable to upload image: ${target.slug}`);

  const { data } = supabase.storage.from("car-images").getPublicUrl(objectPath);
  await updateRecord(car, data.publicUrl, objectPath);
  await verifyObject(objectPath);
  console.info(`Updated fleet image: ${target.slug}`);
}

const fallbackUrl = "/images/cars/tourcoin-vehicle-fallback.svg";
for (const { target, car } of fallbackTargets.matches) {
  await updateRecord(car, fallbackUrl, null);
  console.info(`Applied verified fallback: ${target.slug}`);
}

if (realTargets.skipped.length || fallbackTargets.skipped.length) {
  process.exitCode = 2;
}
