import type { MetadataRoute } from "next";
import { isCanonicalProductionSite, resolvePublicSiteUrl } from "@/lib/auth/site-url";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = resolvePublicSiteUrl();
  if (!isCanonicalProductionSite(baseUrl)) {
    return {
      rules: { userAgent: "*", disallow: "/" },
    };
  }

  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/admin/"] },
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
