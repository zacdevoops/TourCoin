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
    const expectedUrl = new URL(configuredSite);
    const configuredHostname = expectedUrl.hostname.toLowerCase();
    const apexHostname = configuredHostname.replace(/^www\./, "");
    const trustedHostnames = new Set([
      apexHostname,
      `www.${apexHostname}`,
    ]);

    function isTrustedUrl(value: string): boolean {
      const candidate = new URL(value);
      return (
        candidate.protocol === expectedUrl.protocol &&
        candidate.port === expectedUrl.port &&
        trustedHostnames.has(candidate.hostname.toLowerCase()) &&
        !candidate.username &&
        !candidate.password
      );
    }

    const origin = request.headers.get("origin");
    if (origin) {
      return isTrustedUrl(origin);
    }

    const referer = request.headers.get("referer");
    return Boolean(referer && isTrustedUrl(referer));
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
