"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import type { AdminActionState } from "./action-state";
import { getPasswordChangeContext } from "./password-session";
import { getPasswordRecoveryRedirectTo } from "@/lib/auth/site-url";

const requestSchema = z.object({
  email: z.email("Saisissez une adresse e-mail valide.").max(254),
});

const changeSchema = z
  .object({
    current: z.string().optional(),
    password: z
      .string()
      .min(8, "Le mot de passe doit contenir au moins 8 caractères.")
      .max(200, "Le mot de passe est trop long."),
    confirm: z.string(),
  })
  .refine((value) => value.password === value.confirm, {
    message: "Les mots de passe ne correspondent pas.",
    path: ["confirm"],
  });

function validationError(error: z.ZodError): AdminActionState {
  return {
    status: "error",
    message: "Vérifiez les champs indiqués.",
    fieldErrors: error.flatten().fieldErrors,
  };
}

function friendlyUpdateMessage(message: string) {
  const normalized = message.toLowerCase();
  if (normalized.includes("current") || normalized.includes("actuel")) {
    return "Le mot de passe actuel est incorrect.";
  }
  if (normalized.includes("same") || normalized.includes("different")) {
    return "Le nouveau mot de passe doit être différent de l’actuel.";
  }
  if (normalized.includes("weak") || normalized.includes("least") || normalized.includes("characters")) {
    return "Le mot de passe n’est pas assez robuste.";
  }
  return "Impossible d’enregistrer le nouveau mot de passe.";
}

export async function requestPasswordReset(
  _previous: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  let session;
  try {
    session = await getPasswordChangeContext();
  } catch {
    return { status: "error", message: "La réinitialisation est momentanément indisponible." };
  }

  if (session.authenticated) {
    return {
      status: "error",
      message: "Vous êtes déjà connecté. Changez votre mot de passe directement, sans e-mail.",
    };
  }

  const parsed = requestSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) return validationError(parsed.error);

  let redirectTo: string;
  try {
    redirectTo = getPasswordRecoveryRedirectTo();
  } catch {
    return {
      status: "error",
      message: "La configuration du site est incomplète. Impossible d’envoyer l’e-mail.",
    };
  }

  const { error } = await session.supabase.auth.resetPasswordForEmail(parsed.data.email, { redirectTo });
  if (error) {
    return {
      status: "error",
      message: "Impossible d’envoyer l’e-mail de réinitialisation pour le moment.",
    };
  }

  return {
    status: "success",
    message: "Si un compte existe, un e-mail de réinitialisation a été envoyé.",
  };
}

export async function updatePassword(
  _previous: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  let context;
  try {
    context = await getPasswordChangeContext();
  } catch {
    return { status: "error", message: "La modification du mot de passe est momentanément indisponible." };
  }

  if (!context.user) {
    return {
      status: "error",
      message: "Votre session a expiré. Reconnectez-vous pour changer le mot de passe.",
    };
  }

  const parsed = changeSchema.safeParse({
    current: formData.get("current") || undefined,
    password: formData.get("password"),
    confirm: formData.get("confirm"),
  });
  if (!parsed.success) return validationError(parsed.error);

  if (context.requireCurrentPassword && !parsed.data.current) {
    return {
      status: "error",
      message: "Vérifiez les champs indiqués.",
      fieldErrors: { current: ["Le mot de passe actuel est requis."] },
    };
  }

  const attributes: { password: string; current_password?: string } = {
    password: parsed.data.password,
  };
  if (context.requireCurrentPassword && parsed.data.current) {
    attributes.current_password = parsed.data.current;
  }

  const { error } = await context.supabase.auth.updateUser(attributes);
  if (error) {
    return { status: "error", message: friendlyUpdateMessage(error.message) };
  }

  await context.supabase.auth.signOut();
  redirect("/admin/login?reset=success");
}
