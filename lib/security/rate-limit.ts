import "server-only";

import { createHash } from "node:crypto";

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

import {
  BOOKING_RATE_LIMIT,
  BOOKING_RATE_WINDOW_MS,
} from "@/lib/booking/constants";

type Bucket = { count: number; resetAt: number };

const developmentBuckets = new Map<string, Bucket>();

function anonymize(value: string): string {
  return createHash("sha256").update(value).digest("hex").slice(0, 32);
}

function developmentLimit(key: string): boolean {
  const now = Date.now();
  if (developmentBuckets.size >= 5_000) {
    for (const [bucketKey, bucket] of developmentBuckets) {
      if (bucket.resetAt <= now || developmentBuckets.size >= 5_000) {
        developmentBuckets.delete(bucketKey);
      }
      if (developmentBuckets.size < 4_000) break;
    }
  }
  const current = developmentBuckets.get(key);

  if (!current || current.resetAt <= now) {
    developmentBuckets.set(key, {
      count: 1,
      resetAt: now + BOOKING_RATE_WINDOW_MS,
    });
    return true;
  }

  current.count += 1;
  return current.count <= BOOKING_RATE_LIMIT;
}

export async function checkBookingRateLimit(ip: string): Promise<boolean> {
  const key = anonymize(ip);
  if (process.env.NODE_ENV !== "production") {
    return developmentLimit(key);
  }

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    return false;
  }

  try {
    const ratelimit = new Ratelimit({
      redis: new Redis({ url, token }),
      limiter: Ratelimit.slidingWindow(BOOKING_RATE_LIMIT, "10 m"),
      prefix: "tourcoin:booking",
      analytics: false,
    });
    const result = await ratelimit.limit(key);
    return result.success;
  } catch {
    return false;
  }
}
