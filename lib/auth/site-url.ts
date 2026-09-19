function originFrom(value: string) {
  const url = new URL(value);
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("Site URL must be an absolute http(s) URL.");
  }
  return url.origin;
}

export function resolvePublicSiteUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) {
    return originFrom(configured);
  }

  const vercelHost = process.env.VERCEL_URL?.trim();
  if (vercelHost) {
    return originFrom(`https://${vercelHost.replace(/^https?:\/\//, "")}`);
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("NEXT_PUBLIC_SITE_URL is required in production.");
  }

  return "http://localhost:3000";
}

export function isCanonicalProductionSite(siteUrl = resolvePublicSiteUrl()) {
  try {
    const host = new URL(siteUrl).hostname.toLowerCase();
    return host === "tourcoin.ma" || host === "www.tourcoin.ma";
  } catch {
    return false;
  }
}

export function getSiteUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!configured) {
    throw new Error("NEXT_PUBLIC_SITE_URL is required.");
  }

  return originFrom(configured);
}

export function getPasswordRecoveryRedirectTo() {
  return `${getSiteUrl()}/auth/callback?next=/admin/reset-password`;
}

export function safeAuthNextPath(next: string | null | undefined) {
  if (next === "/admin/reset-password" || next === "/admin/login") {
    return next;
  }
  return "/admin/reset-password";
}
