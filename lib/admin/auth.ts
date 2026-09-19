import type { SupabaseClient, User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { createAdminSupabaseClient } from "./supabase";

export type AdminAccess =
  | { status: "authorized"; user: User; supabase: SupabaseClient }
  | { status: "unauthenticated"; message: string }
  | { status: "forbidden"; message: string }
  | { status: "error"; message: string };

export async function verifyAdmin(): Promise<AdminAccess> {
  let supabase: SupabaseClient;

  try {
    supabase = await createAdminSupabaseClient();
  } catch {
    return {
      status: "error",
      message: "Impossible de vérifier l’accès administrateur.",
    };
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      status: "unauthenticated",
      message: "Votre session a expiré. Veuillez vous reconnecter.",
    };
  }

  const { data, error } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    return {
      status: "error",
      message: "La vérification de vos droits a échoué.",
    };
  }

  if (!data) {
    return {
      status: "forbidden",
      message: "Ce compte n’est pas autorisé à administrer Tourcoin.",
    };
  }

  return { status: "authorized", user, supabase };
}

export async function requireAdminPage() {
  const access = await verifyAdmin();
  if (access.status === "unauthenticated") {
    redirect("/admin/login");
  }
  return access;
}
