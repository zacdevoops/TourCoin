import type { NextConfig } from "next";
const scriptPolicy =
  process.env.NODE_ENV === "development"
    ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
    : "script-src 'self' 'unsafe-inline'";

const stagingRobots =
  process.env.NEXT_PUBLIC_SITE_URL &&
  /^https:\/\/(www\.)?tourcoin\.ma\/?$/i.test(process.env.NEXT_PUBLIC_SITE_URL)
    ? null
    : { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" };

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    dangerouslyAllowLocalIP: process.env.NODE_ENV === "development",
    qualities: [75, 82],
    remotePatterns: [
      new URL(
        "https://bymcdiukbibzlaxusrjf.supabase.co/storage/v1/object/public/car-images/**",
      ),
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          ...(stagingRobots ? [stagingRobots] : []),
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              "object-src 'none'",
              scriptPolicy,
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' blob: data: https:",
              "font-src 'self'",
              "connect-src 'self' https://*.supabase.co https://*.upstash.io",
              "upgrade-insecure-requests",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
