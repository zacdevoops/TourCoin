import "server-only";

export function hasTrustedBookingOrigin(request: Request): boolean {
  if (process.env.NODE_ENV !== "production") {
    return true;
  }

  const configuredSite = process.env.NEXT_PUBLIC_SITE_URL;
  if (!configuredSite) {
    return false;
  }

  try {
    const expectedOrigin = new URL(configuredSite).origin;
    const origin = request.headers.get("origin");
    if (origin) {
      return new URL(origin).origin === expectedOrigin;
    }

    const referer = request.headers.get("referer");
    return Boolean(referer && new URL(referer).origin === expectedOrigin);
  } catch {
    return false;
  }
}

export function getRequestIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip")?.trim() ||
    "unknown"
  );
}
