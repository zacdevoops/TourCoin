import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { safeAuthNextPath } from "@/lib/auth/site-url";

type RecoveryOtpType = "recovery" | "email";

function isRecoveryOtpType(value: string | null): value is RecoveryOtpType {
  return value === "recovery" || value === "email";
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type");
  const next = safeAuthNextPath(url.searchParams.get("next"));
  const destination = new URL(next, url.origin);
  const failure = new URL("/admin/reset-password?error=invalid", url.origin);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !anonKey) {
    return NextResponse.redirect(failure);
  }

  let response = NextResponse.redirect(destination);
  const supabase = createServerClient(supabaseUrl, anonKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.redirect(destination);
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  let error: { message: string } | null = null;

  if (code) {
    ({ error } = await supabase.auth.exchangeCodeForSession(code));
  } else if (tokenHash && isRecoveryOtpType(type)) {
    ({ error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash }));
  } else {
    return NextResponse.redirect(failure);
  }

  if (error) {
    return NextResponse.redirect(failure);
  }

  return response;
}
