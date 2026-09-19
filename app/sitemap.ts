import type { MetadataRoute } from "next";
import { isCanonicalProductionSite, resolvePublicSiteUrl } from "@/lib/auth/site-url";
import { getFleet } from "@/lib/fleet/queries";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = resolvePublicSiteUrl();
  if (!isCanonicalProductionSite(baseUrl)) {
    return [];
  }
  const { cars, unavailable } = await getFleet();
  const staticPages = ["", "/cars", "/contact", "/privacy", "/photo-credits"].map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "weekly" as const : "monthly" as const,
    priority: path === "" ? 1 : path === "/cars" ? 0.9 : 0.5,
  }));
  if (unavailable) return staticPages;
  return [...staticPages, ...cars.map((car) => ({
    url: `${baseUrl}/cars/${car.slug}`,
    lastModified: new Date(car.updatedAt),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }))];
}
