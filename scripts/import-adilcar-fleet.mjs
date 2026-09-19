import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const APPLY = process.argv.includes("--apply");
const ROLLBACK = process.argv.includes("--rollback");
const TOURCOIN_REF = "bymcdiukbibzlaxusrjf";
const ADILCAR_CARS = "/Users/zac/Projects/CarAdil/public/images/cars";
const BACKUP_PATH = path.join(
  process.cwd(),
  "scripts",
  "fleet-migration",
  "backup-pre-adilcar-import.json",
);
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

const MINI_SLUGS = new Set(["kia-picanto", "hyundai-i10", "fiat-500"]);

const SAFE_PHOTO_ACTIVATIONS = [
  {
    slug: "citroen-c3",
    brand: "Citroën",
    model: "C3",
    sourceFile: "citroen-c3.jpg",
    reason: "2023 économique, priced, current-generation photo, no readable plate",
  },
  {
    slug: "hyundai-i20",
    brand: "Hyundai",
    model: "i20",
    sourceFile: "hyundai-i20.jpg",
    reason: "2023 économique, priced, current-generation photo, plate blacked out",
  },
  {
    slug: "kia-rio",
    brand: "Kia",
    model: "Rio",
    sourceFile: "kia-rio.jpg",
    reason: "2023 économique, priced, current-generation photo, no plate",
  },
  {
    slug: "renault-taliant",
    brand: "Renault",
    model: "Taliant",
    sourceFile: "renault-taliant.jpg",
    reason: "2023 compacte, priced, current-generation photo, blank plate",
  },
];

function norm(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

async function must(result, context) {
  if (result.error) throw new Error(`${context}: ${result.error.message}`);
  return result.data;
}

async function readFleet() {
  return must(
    await supabase
      .from("cars")
      .select(
        "id,slug,brand,model,name,year,category,price_per_day,currency,fuel,transmission,seats,doors,description,image_url,image_path,active,featured,sort_order,created_at,updated_at",
      )
      .order("slug"),
    "Unable to read live Tourcoin cars",
  );
}

function matchExact(car, target) {
  return (
    car.slug === target.slug &&
    norm(car.brand) === norm(target.brand) &&
    norm(car.model) === norm(target.model)
  );
}

async function rollback() {
  const backup = JSON.parse(await readFile(BACKUP_PATH, "utf8"));
  if (!Array.isArray(backup.rows) || backup.projectRef !== TOURCOIN_REF) {
    throw new Error("Backup file is missing or is not a Tourcoin snapshot.");
  }
  for (const row of backup.rows) {
    const { error } = await supabase
      .from("cars")
      .update({
        image_url: row.image_url,
        image_path: row.image_path,
        active: row.active,
        featured: row.featured,
        price_per_day: row.price_per_day,
        category: row.category,
        year: row.year,
      })
      .eq("id", row.id)
      .eq("slug", row.slug);
    if (error) throw new Error(`Rollback failed for ${row.slug}: ${error.message}`);
  }
  console.info(`rollback_ok rows=${backup.rows.length}`);
}

async function applyActivations(live) {
  const bySlug = new Map(live.map((car) => [car.slug, car]));
  const uploaded = [];

  await mkdir(path.join(process.cwd(), "public", "images", "cars"), { recursive: true });
  await mkdir(path.dirname(BACKUP_PATH), { recursive: true });
  await writeFile(
    BACKUP_PATH,
    JSON.stringify(
      { projectRef, createdAt: new Date().toISOString(), rows: live },
      null,
      2,
    ),
  );

  for (const target of SAFE_PHOTO_ACTIVATIONS) {
    const car = bySlug.get(target.slug);
    if (!car || !matchExact(car, target)) {
      throw new Error(`Refusing to update unmatched record: ${target.slug}`);
    }
    if (!(Number(car.price_per_day) > 0)) {
      throw new Error(`Refusing to activate unpriced record: ${target.slug}`);
    }
    if (car.year < 2023 || car.year > 2026) {
      throw new Error(`Refusing to activate out-of-year record: ${target.slug}`);
    }
    if (car.image_url?.includes("/storage/v1/object/public/car-images/")) {
      throw new Error(`Refusing to overwrite approved Tourcoin photo: ${target.slug}`);
    }

    const localName = target.sourceFile.replace(".jpg", "-adilcar.jpg");
    const localPath = path.join(process.cwd(), "public", "images", "cars", localName);
    await copyFile(path.join(ADILCAR_CARS, target.sourceFile), localPath);

    const objectPath = `${car.id}/main.jpg`;
    const bytes = await readFile(localPath);
    const { error: uploadError } = await supabase.storage
      .from("car-images")
      .upload(objectPath, bytes, {
        contentType: "image/jpeg",
        cacheControl: "3600",
        upsert: true,
      });
    if (uploadError) throw new Error(`Upload failed for ${target.slug}: ${uploadError.message}`);

    const { data } = supabase.storage.from("car-images").getPublicUrl(objectPath);
    const { error: updateError } = await supabase
      .from("cars")
      .update({
        image_url: data.publicUrl,
        image_path: objectPath,
        active: true,
        featured: false,
      })
      .eq("id", car.id)
      .eq("slug", car.slug)
      .eq("brand", car.brand)
      .eq("model", car.model);
    if (updateError) throw new Error(`Update failed for ${target.slug}: ${updateError.message}`);
    uploaded.push({ slug: target.slug, id: car.id, image_path: objectPath });
    console.info(`activated ${target.slug}`);
  }

  const mini = live.filter((car) => MINI_SLUGS.has(car.slug));
  for (const car of mini) {
    if (car.active) {
      const { error } = await supabase
        .from("cars")
        .update({ active: false, featured: false })
        .eq("id", car.id)
        .eq("slug", car.slug);
      if (error) throw new Error(`Unable to keep Mini inactive: ${car.slug}`);
      console.info(`deactivated_mini ${car.slug}`);
    }
  }

  await writeFile(
    path.join(process.cwd(), "scripts", "fleet-migration", "last-apply.json"),
    JSON.stringify({ projectRef, uploaded, at: new Date().toISOString() }, null, 2),
  );
}

const live = await readFleet();
const bySlug = new Map(live.map((car) => [car.slug, car]));

const dryRun = SAFE_PHOTO_ACTIVATIONS.map((target) => {
  const car = bySlug.get(target.slug);
  return {
    SOURCE: `${target.brand} ${target.model}`,
    ACTION: car && matchExact(car, target) ? "SAFE_UPDATE" : "CONFLICT",
    TARGET: target.slug,
    CATEGORY: car?.category ?? "missing",
    PRICE_ACTION: "KEEP TOURCOIN PRICE",
    PHOTO_ACTION: "REUSE ADILCAR PHOTO",
    ACTIVE_STATE: "ACTIVE",
    REASON: target.reason,
  };
});

console.info(
  JSON.stringify(
    {
      mode: ROLLBACK ? "rollback" : APPLY ? "apply" : "dry-run",
      projectRef,
      liveCount: live.length,
      liveActive: live.filter((car) => car.active).map((car) => car.slug),
      miniPresent: live.filter((car) => MINI_SLUGS.has(car.slug)).map((car) => ({
        slug: car.slug,
        active: car.active,
        category: car.category,
      })),
      classeC: live
        .filter((car) => norm(car.model) === "classe c")
        .map((car) => car.slug),
      safeUpdates: dryRun,
      blocked: [
        "Mini Picanto / i10 / Fiat 500 → keep inactive, no delete",
        "Seat Ibiza 2022 → MODEL_REVIEW_REQUIRED, cannot activate without faking year",
        "Toyota Yaris AdilCar photo is XP130, not 2023 generation → PHOTO_REVIEW_REQUIRED",
        "VW Polo AdilCar photo is pre-facelift for a 2023 record → PHOTO_REVIEW_REQUIRED",
        "Dacia Sandero Dutch plate K-210-XZ → PHOTO rejected",
        "Dacia Logan RO plate → PHOTO rejected for essence and diesel",
        "Null-price AdilCar / Tourcoin rows stay inactive PRICE_REVIEW_REQUIRED",
        "mercedes-classe-c not inserted; mercedes-benz-classe-c already exists",
      ],
    },
    null,
    2,
  ),
);

if (ROLLBACK) {
  await rollback();
} else if (APPLY) {
  const conflict = dryRun.find((row) => row.ACTION !== "SAFE_UPDATE");
  if (conflict) throw new Error(`Dry-run is not consistent: ${conflict.SOURCE}`);
  await applyActivations(live);
  const after = await readFleet();
  console.info(
    JSON.stringify(
      {
        apply: "ok",
        active: after.filter((car) => car.active).map((car) => ({
          slug: car.slug,
          category: car.category,
          price: car.price_per_day,
        })),
        inactive: after.filter((car) => !car.active).length,
        miniActive: after.filter((car) => MINI_SLUGS.has(car.slug) && car.active).length,
      },
      null,
      2,
    ),
  );
} else {
  console.info("dry_run_only no writes");
}
