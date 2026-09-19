"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { BOOKING_STATUSES, CAR_CATEGORIES, CAR_SEGMENTS, FUEL_TYPES, PRODUCT_CATEGORIES, TRANSMISSIONS } from "@/types/domain";
import { INITIAL_ACTION_STATE, type AdminActionState } from "./action-state";
import { verifyAdmin, type AdminAccess } from "./auth";
import { createAdminSupabaseClient } from "./supabase";

const requiredText = (label: string, max: number) =>
  z.string().trim().min(1, `${label} est requis.`).max(max, `${label} est trop long.`);
const integerField = (label: string, min: number, max: number) =>
  z.coerce
    .number({ error: `${label} doit être un nombre.` })
    .int(`${label} doit être un nombre entier.`)
    .min(min, `${label} doit être au moins ${min}.`)
    .max(max, `${label} doit être au plus ${max}.`);

const carSchema = z.object({
  id: z.uuid().optional(),
  slug: z
    .string()
    .trim()
    .min(1, "Le slug est requis.")
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Utilisez uniquement minuscules, chiffres et tirets."),
  brand: requiredText("La marque", 80),
  model: requiredText("Le modèle", 80),
  name: requiredText("Le nom", 120),
  year: integerField("L’année", 1990, 2026),
  category: z.enum(CAR_CATEGORIES),
  segment: z.preprocess(
    (value) => (value === "" || value === undefined ? null : value),
    z.union([z.null(), z.enum(CAR_SEGMENTS)]),
  ),
  pricePerDay: z.preprocess(
    (value) => (value === "" || value === null || value === undefined ? null : value),
    z.union([z.null(), integerField("Le prix", 1, 100000)]),
  ),
  fuel: z.enum(FUEL_TYPES),
  transmission: z.enum(TRANSMISSIONS),
  seats: integerField("Le nombre de places", 1, 12),
  doors: integerField("Le nombre de portes", 2, 6),
  description: z
    .string()
    .trim()
    .min(20, "La description doit contenir au moins 20 caractères.")
    .max(3000, "La description est trop longue."),
  sortOrder: integerField("L’ordre", -100000, 100000),
  active: z.boolean(),
  featured: z.boolean(),
});

const publicCarSchema = carSchema.extend({
  category: z.enum(PRODUCT_CATEGORIES, {
    error: "Choisissez une catégorie publique : économique, compacte, SUV ou berline routière.",
  }),
});

const loginSchema = z.object({
  email: z.email("Saisissez une adresse e-mail valide.").max(254),
  password: z.string().min(1, "Le mot de passe est requis.").max(200),
});

const idSchema = z.object({ id: z.uuid("Identifiant invalide.") });
const toggleSchema = idSchema.extend({
  field: z.enum(["active", "featured"]),
  value: z.enum(["true", "false"]),
});
const bookingStatusSchema = idSchema.extend({
  status: z.enum(BOOKING_STATUSES),
});

function validationError(error: z.ZodError): AdminActionState {
  return {
    status: "error",
    message: "Vérifiez les champs indiqués.",
    fieldErrors: error.flatten().fieldErrors,
  };
}

function formBoolean(value: FormDataEntryValue | null) {
  return value === "on" || value === "true";
}

function carFormValues(formData: FormData) {
  return {
    id: formData.get("id") || undefined,
    slug: formData.get("slug"),
    brand: formData.get("brand"),
    model: formData.get("model"),
    name: formData.get("name"),
    year: formData.get("year"),
    category: formData.get("category"),
    segment: formData.get("segment"),
    pricePerDay: formData.get("pricePerDay"),
    fuel: formData.get("fuel"),
    transmission: formData.get("transmission"),
    seats: formData.get("seats"),
    doors: formData.get("doors"),
    description: formData.get("description"),
    sortOrder: formData.get("sortOrder"),
    active: formBoolean(formData.get("active")),
    featured: formBoolean(formData.get("featured")),
  };
}

function parseCarForm(formData: FormData) {
  return carSchema.safeParse(carFormValues(formData));
}

function imageFrom(formData: FormData) {
  const value = formData.get("image");
  return value instanceof File && value.size > 0 ? value : null;
}

function validateImage(image: File | null, required: boolean): AdminActionState | null {
  if (!image) {
    return required
      ? {
          status: "error",
          message: "Ajoutez une image du véhicule.",
          fieldErrors: { image: ["L’image est requise."] },
        }
      : null;
  }

  if (!["image/jpeg", "image/png", "image/webp"].includes(image.type)) {
    return {
      status: "error",
      message: "Format d’image non accepté.",
      fieldErrors: { image: ["Utilisez une image JPG, PNG ou WebP."] },
    };
  }
  if (image.size > 5 * 1024 * 1024) {
    return {
      status: "error",
      message: "L’image dépasse la taille autorisée.",
      fieldErrors: { image: ["La taille maximale est de 5 Mo."] },
    };
  }
  return null;
}

async function hasValidImageSignature(image: File): Promise<boolean> {
  const bytes = new Uint8Array(await image.slice(0, 12).arrayBuffer());
  if (image.type === "image/jpeg") {
    return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }
  if (image.type === "image/png") {
    return [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]
      .every((value, index) => bytes[index] === value);
  }
  if (image.type === "image/webp") {
    return (
      String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
      String.fromCharCode(...bytes.slice(8, 12)) === "WEBP"
    );
  }
  return false;
}

type AuthorizedAccess = Extract<AdminAccess, { status: "authorized" }>;

async function authorizedAction(): Promise<
  { error: AdminActionState } | { access: AuthorizedAccess }
> {
  const access = await verifyAdmin();
  if (access.status !== "authorized") {
    return {
      error: {
        status: "error" as const,
        message:
          access.status === "forbidden"
            ? "Votre compte n’a pas les droits administrateur."
            : "Votre session n’est plus valide. Reconnectez-vous.",
      },
    };
  }
  return { access };
}

function carRow(values: z.infer<typeof carSchema>, image?: { url: string; path: string }) {
  return {
    slug: values.slug,
    brand: values.brand,
    model: values.model,
    name: values.name,
    year: values.year,
    category: values.category,
    segment: values.segment,
    price_per_day: values.pricePerDay,
    currency: "MAD",
    fuel: values.fuel,
    transmission: values.transmission,
    seats: values.seats,
    doors: values.doors,
    description: values.description,
    sort_order: values.sortOrder,
    active: values.active,
    featured: values.featured,
    ...(image ? { image_url: image.url, image_path: image.path } : {}),
  };
}

async function uploadImage(
  image: File,
  supabase: Awaited<ReturnType<typeof createAdminSupabaseClient>>,
) {
  const extension =
    image.type === "image/png" ? "png" : image.type === "image/webp" ? "webp" : "jpg";
  const path = `cars/${crypto.randomUUID()}.${extension}`;
  const bytes = await image.arrayBuffer();
  const { error } = await supabase.storage
    .from("car-images")
    .upload(path, bytes, { contentType: image.type, upsert: false });

  if (error) return { error: "L’envoi de l’image a échoué." };
  const { data } = supabase.storage.from("car-images").getPublicUrl(path);
  return { image: { path, url: data.publicUrl } };
}

async function removeImage(
  supabase: Awaited<ReturnType<typeof createAdminSupabaseClient>>,
  path: string | null,
) {
  if (path) await supabase.storage.from("car-images").remove([path]);
}

function refreshCars(slugs: string[] = []) {
  revalidatePath("/");
  revalidatePath("/cars");
  revalidatePath("/admin");
  revalidatePath("/admin/cars");
  slugs.forEach((slug) => revalidatePath(`/cars/${slug}`));
  revalidateTag("cars", "max");
  revalidateTag("featured-cars", "max");
}

export async function loginAdmin(
  _previous: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return validationError(parsed.error);

  let supabase;
  try {
    supabase = await createAdminSupabaseClient();
  } catch {
    return { status: "error", message: "La connexion est momentanément indisponible." };
  }

  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error || !data.user) {
    return { status: "error", message: "E-mail ou mot de passe incorrect." };
  }

  const { data: membership, error: membershipError } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", data.user.id)
    .maybeSingle();
  if (membershipError || !membership) {
    await supabase.auth.signOut();
    return {
      status: "error",
      message: membershipError
        ? "Impossible de vérifier vos droits pour le moment."
        : "Ce compte n’est pas autorisé à administrer Tourcoin.",
    };
  }
  redirect("/admin");
}

export async function signOutAdmin() {
  const supabase = await createAdminSupabaseClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export async function createCar(
  _previous: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const auth = await authorizedAction();
  if ("error" in auth) return auth.error;
  const parsed = publicCarSchema.safeParse(carFormValues(formData));
  if (!parsed.success) return validationError(parsed.error);
  const image = imageFrom(formData);
  const imageError = validateImage(image, true);
  if (imageError) return imageError;
  if (!(await hasValidImageSignature(image!))) {
    return { status: "error", message: "Le contenu de l’image n’est pas valide." };
  }

  const uploaded = await uploadImage(image!, auth.access.supabase);
  if (!uploaded.image) {
    return { status: "error", message: uploaded.error ?? "L’envoi de l’image a échoué." };
  }

  const { error } = await auth.access.supabase
    .from("cars")
    .insert(carRow(parsed.data, { url: uploaded.image.url, path: uploaded.image.path }));
  if (error) {
    await removeImage(auth.access.supabase, uploaded.image.path);
    return {
      status: "error",
      message:
        error.code === "23505"
          ? "Ce slug est déjà utilisé."
          : "Le véhicule n’a pas pu être enregistré.",
    };
  }

  refreshCars([parsed.data.slug]);
  redirect("/admin/cars");
}

export async function updateCar(
  _previous: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const auth = await authorizedAction();
  if ("error" in auth) return auth.error;
  const parsed = parseCarForm(formData);
  if (!parsed.success) return validationError(parsed.error);
  if (!parsed.data.id) return { status: "error", message: "Identifiant du véhicule absent." };

  const { data: existing, error: readError } = await auth.access.supabase
    .from("cars")
    .select("slug,image_path")
    .eq("id", parsed.data.id)
    .maybeSingle();
  if (readError || !existing) {
    return { status: "error", message: "Ce véhicule est introuvable." };
  }

  const image = imageFrom(formData);
  const imageError = validateImage(image, false);
  if (imageError) return imageError;
  if (image && !(await hasValidImageSignature(image))) {
    return { status: "error", message: "Le contenu de l’image n’est pas valide." };
  }
  const uploaded = image ? await uploadImage(image, auth.access.supabase) : null;
  if (uploaded && !uploaded.image) {
    return { status: "error", message: uploaded.error ?? "L’envoi de l’image a échoué." };
  }

  const { error } = await auth.access.supabase
    .from("cars")
    .update(carRow(parsed.data, uploaded?.image))
    .eq("id", parsed.data.id);
  if (error) {
    if (uploaded?.image) await removeImage(auth.access.supabase, uploaded.image.path);
    return {
      status: "error",
      message:
        error.code === "23505"
          ? "Ce slug est déjà utilisé."
          : "Les modifications n’ont pas pu être enregistrées.",
    };
  }

  if (uploaded?.image) {
    await removeImage(auth.access.supabase, existing.image_path);
  }
  refreshCars([existing.slug, parsed.data.slug]);
  redirect("/admin/cars");
}

export async function toggleCar(
  _previous: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const auth = await authorizedAction();
  if ("error" in auth) return auth.error;
  const parsed = toggleSchema.safeParse({
    id: formData.get("id"),
    field: formData.get("field"),
    value: formData.get("value"),
  });
  if (!parsed.success) return validationError(parsed.error);
  const { data: existing } = await auth.access.supabase
    .from("cars")
    .select("slug")
    .eq("id", parsed.data.id)
    .maybeSingle();
  const { error } = await auth.access.supabase
    .from("cars")
    .update({ [parsed.data.field]: parsed.data.value === "true" })
    .eq("id", parsed.data.id);
  if (error) return { status: "error", message: "La mise à jour a échoué." };
  refreshCars(existing?.slug ? [existing.slug] : []);
  return INITIAL_ACTION_STATE;
}

export async function deleteCar(
  _previous: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const auth = await authorizedAction();
  if ("error" in auth) return auth.error;
  const parsed = idSchema.safeParse({ id: formData.get("id") });
  if (!parsed.success) return validationError(parsed.error);

  const { data: existing } = await auth.access.supabase
    .from("cars")
    .select("slug,image_path")
    .eq("id", parsed.data.id)
    .maybeSingle();
  if (!existing) return { status: "error", message: "Ce véhicule est introuvable." };
  const { error } = await auth.access.supabase.from("cars").delete().eq("id", parsed.data.id);
  if (error) return { status: "error", message: "La suppression a échoué." };
  await removeImage(auth.access.supabase, existing.image_path);
  refreshCars([existing.slug]);
  return INITIAL_ACTION_STATE;
}

export async function updateBookingStatus(
  _previous: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const auth = await authorizedAction();
  if ("error" in auth) return auth.error;
  const parsed = bookingStatusSchema.safeParse({
    id: formData.get("id"),
    status: formData.get("status"),
  });
  if (!parsed.success) return validationError(parsed.error);
  const { error } = await auth.access.supabase
    .from("booking_requests")
    .update({ status: parsed.data.status })
    .eq("id", parsed.data.id);
  if (!error) {
    revalidatePath("/admin");
    revalidatePath("/admin/bookings");
    revalidateTag("bookings", "max");
    return INITIAL_ACTION_STATE;
  }
  return { status: "error", message: "Le statut n’a pas pu être mis à jour." };
}
