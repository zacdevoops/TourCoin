import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error("La configuration Supabase est incomplète.");
  }

  return { url, anonKey };
}

export async function createAdminSupabaseClient() {
  const cookieStore = await cookies();
  const { url, anonKey } = getSupabaseConfig();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components cannot write cookies. proxy.ts refreshes them.
        }
      },
    },
  });
}
