import { isPickupLocationSlug } from "@/lib/booking/constants";
import { isCarSegment, isProductCategory } from "@/types/domain";

export type CatalogSearchValues = {
  q?: string;
  category?: string;
  segment?: string;
  fuel?: string;
  transmission?: string;
  sort?: string;
  location?: string;
  pickup?: string;
  return?: string;
};

const catalogKeys = [
  "q",
  "category",
  "segment",
  "fuel",
  "transmission",
  "sort",
  "location",
  "pickup",
  "return",
] as const;

export function catalogSearchHref(
  values: CatalogSearchValues,
  page = 1,
): string {
  const params = new URLSearchParams();
  for (const key of catalogKeys) {
    const value = values[key];
    if (value) params.set(key, value);
  }
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `/cars?${query}` : "/cars";
}

function isIsoDate(value: string | undefined): value is string {
  return Boolean(value && /^\d{4}-\d{2}-\d{2}$/.test(value));
}

export function sanitizeCatalogValues(
  values: CatalogSearchValues,
): CatalogSearchValues {
  const segment = isCarSegment(values.segment) ? values.segment : undefined;
  return {
    ...values,
    category: segment ? undefined : isProductCategory(values.category) ? values.category : undefined,
    segment: segment === "suv_urbain" ? segment : undefined,
    location: isPickupLocationSlug(values.location) ? values.location : undefined,
    pickup: isIsoDate(values.pickup) ? values.pickup : undefined,
    return: isIsoDate(values.return) ? values.return : undefined,
  };
}
