# Tourcoin

Production-oriented car-rental request application for Morocco. Tourcoin is a
single Next.js 16 codebase: public fleet discovery, booking requests, and a
small owner-friendly administration area.

## Local setup

1. Use Node.js 20.9 or newer.
2. Run `npm install`.
3. Copy `.env.example` to `.env.local` and complete the values.
4. Apply `supabase/migrations/001_initial_schema.sql` to a Supabase project.
5. Create an Auth user, then insert that user's UUID into `admin_users`.
6. Run `npm run dev`.

Without Supabase variables, development uses the demo fleet. Production never
uses that fallback and renders a controlled unavailable state.

After the verified fleet records exist in Supabase, upload the normalized local
WebP assets and update their storage paths with:

```sh
npm run fleet:sync-images
```

The command requires the production site URL and server-only Supabase service
role key. It updates image fields only; it never changes vehicle prices.

## Required environment

- `NEXT_PUBLIC_SITE_URL`: canonical production origin, for example
  `https://tourcoin.ma`.
- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`: browser-safe
  Supabase configuration.
- `SUPABASE_SERVICE_ROLE_KEY`: server-only booking persistence credential.
  Never expose this value to client code or prefix it with `NEXT_PUBLIC_`.
- `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `BOOKING_NOTIFICATION_EMAIL`: booking
  notification delivery.
- `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`: mandatory in production;
  booking submission fails closed when distributed rate limiting is missing.
- `NEXT_PUBLIC_CONTACT_EMAIL`, `NEXT_PUBLIC_CONTACT_PHONE`,
  `NEXT_PUBLIC_WHATSAPP_NUMBER`: real business contact details. Keep them empty
  until verified; the UI does not invent placeholder business details.

## Security notes

RLS allows anonymous reads of active cars only. Vehicle and booking
administration requires both a valid Supabase session and membership in
`admin_users`. Public booking inserts use a server-only service-role client only
after origin, size, content-type, rate-limit, Zod, date, and active-vehicle
checks.

The production CSP excludes `unsafe-eval`. Next.js currently emits inline
framework, structured-data, and style content, so `unsafe-inline` remains in
`script-src` and `style-src`. Development adds `unsafe-eval` only for React
debugging. A nonce-based CSP can replace inline allowances when Next.js's
dynamic rendering/cache trade-off is accepted.

## Verification

```sh
npm run typecheck
npm run lint
npm run build
```
