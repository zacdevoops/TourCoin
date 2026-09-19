import { createAdminSupabaseClient } from "./supabase";

function readAmrMethods(accessToken: string | undefined) {
  if (!accessToken) return [];
  try {
    const payload = JSON.parse(Buffer.from(accessToken.split(".")[1] ?? "", "base64url").toString());
    if (!Array.isArray(payload.amr)) return [];
    return payload.amr
      .map((entry: unknown) => (typeof entry === "string" ? entry : (entry as { method?: string }).method))
      .filter((method: unknown): method is string => typeof method === "string");
  } catch {
    return [];
  }
}

function isRecoveryMethod(methods: string[]) {
  return methods.includes("recovery") || (methods.includes("otp") && !methods.includes("password"));
}

export async function getPasswordChangeContext() {
  const supabase = await createAdminSupabaseClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { supabase, user: null, authenticated: false, requireCurrentPassword: false };
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();
  const methods = readAmrMethods(session?.access_token);

  return {
    supabase,
    user,
    authenticated: true,
    requireCurrentPassword: !isRecoveryMethod(methods),
  };
}
