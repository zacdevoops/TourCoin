-- Additive only: the live Tourcoin project already has cars + admin_users.
-- Do not recreate those tables. Create the booking snapshot table the app expects.

create extension if not exists pgcrypto;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'booking_status') then
    create type public.booking_status as enum (
      'NEW',
      'CONTACTED',
      'CONFIRMED',
      'CANCELLED'
    );
  end if;
end
$$;

create table if not exists public.booking_requests (
  id uuid primary key default gen_random_uuid(),
  status public.booking_status not null default 'NEW',
  customer_name text not null check (char_length(customer_name) between 2 and 100),
  customer_email text not null check (char_length(customer_email) <= 254),
  customer_phone text not null check (char_length(customer_phone) between 8 and 24),
  car_id uuid references public.cars(id) on delete set null,
  car_slug text not null,
  car_name text not null,
  car_price_per_day integer not null check (car_price_per_day > 0),
  currency text not null default 'MAD' check (currency = 'MAD'),
  pickup_location text not null check (char_length(pickup_location) <= 120),
  pickup_at timestamptz not null,
  return_location text not null check (char_length(return_location) <= 120),
  return_at timestamptz not null,
  message text check (char_length(message) <= 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint booking_dates_valid check (return_at > pickup_at)
);

create index if not exists booking_requests_created_idx
  on public.booking_requests (created_at desc);
create index if not exists booking_requests_status_idx
  on public.booking_requests (status, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists booking_requests_set_updated_at on public.booking_requests;
create trigger booking_requests_set_updated_at
before update on public.booking_requests
for each row execute function public.set_updated_at();

alter table public.booking_requests enable row level security;

drop policy if exists "admins can read booking requests" on public.booking_requests;
create policy "admins can read booking requests"
on public.booking_requests for select
to authenticated
using (public.is_admin());

drop policy if exists "admins can update booking requests" on public.booking_requests;
create policy "admins can update booking requests"
on public.booking_requests for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

revoke all on public.booking_requests from anon, authenticated;
grant select, update on public.booking_requests to authenticated;
