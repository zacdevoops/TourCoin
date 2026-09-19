create extension if not exists pgcrypto;

create type public.car_category as enum (
  'economique',
  'compacte',
  'intermediaire',
  'suv',
  'premium'
);
create type public.fuel_type as enum ('essence', 'diesel', 'hybride');
create type public.transmission_type as enum ('manuelle', 'automatique');
create type public.booking_status as enum (
  'NEW',
  'CONTACTED',
  'CONFIRMED',
  'CANCELLED'
);

create table public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.cars (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique
    check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  brand text not null check (char_length(brand) between 1 and 80),
  model text not null check (char_length(model) between 1 and 80),
  name text not null check (char_length(name) between 1 and 120),
  year integer not null check (year between 2023 and 2026),
  category public.car_category not null,
  price_per_day integer not null check (price_per_day between 1 and 100000),
  currency text not null default 'MAD' check (currency = 'MAD'),
  fuel public.fuel_type not null,
  transmission public.transmission_type not null,
  seats smallint not null check (seats between 1 and 12),
  doors smallint not null check (doors between 2 and 6),
  description text not null check (char_length(description) between 20 and 3000),
  image_url text not null check (image_url ~ '^https://'),
  image_path text,
  active boolean not null default true,
  featured boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.booking_requests (
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

create index cars_public_catalog_idx
  on public.cars (active, sort_order, created_at desc);
create index cars_featured_idx
  on public.cars (featured, active, sort_order);
create index booking_requests_created_idx
  on public.booking_requests (created_at desc);
create index booking_requests_status_idx
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

create trigger cars_set_updated_at
before update on public.cars
for each row execute function public.set_updated_at();

create trigger booking_requests_set_updated_at
before update on public.booking_requests
for each row execute function public.set_updated_at();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = auth.uid()
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

alter table public.admin_users enable row level security;
alter table public.cars enable row level security;
alter table public.booking_requests enable row level security;

create policy "active cars are publicly readable"
on public.cars for select
to anon, authenticated
using (active or public.is_admin());

create policy "admins can insert cars"
on public.cars for insert
to authenticated
with check (public.is_admin());

create policy "admins can update cars"
on public.cars for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "admins can delete cars"
on public.cars for delete
to authenticated
using (public.is_admin());

create policy "admins can read booking requests"
on public.booking_requests for select
to authenticated
using (public.is_admin());

create policy "admins can update booking requests"
on public.booking_requests for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "admins can read their authorization record"
on public.admin_users for select
to authenticated
using (user_id = auth.uid());

revoke insert, update, delete on public.cars from anon;
revoke all on public.booking_requests from anon, authenticated;
grant select, update on public.booking_requests to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'car-images',
  'car-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "car images are publicly readable"
on storage.objects for select
to public
using (bucket_id = 'car-images');

create policy "admins can upload car images"
on storage.objects for insert
to authenticated
with check (bucket_id = 'car-images' and public.is_admin());

create policy "admins can update car images"
on storage.objects for update
to authenticated
using (bucket_id = 'car-images' and public.is_admin())
with check (bucket_id = 'car-images' and public.is_admin());

create policy "admins can delete car images"
on storage.objects for delete
to authenticated
using (bucket_id = 'car-images' and public.is_admin());
