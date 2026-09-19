begin;

-- The dedicated Tourcoin project was initially seeded with legacy English
-- catalogue values. Normalize those values before enforcing the application
-- domain. This migration does not alter RLS, auth, bookings, or storage policy.
update public.cars
set
  active = false,
  featured = false,
  category = case category
    when 'mini' then 'economique'
    when 'economy' then 'economique'
    when 'compact' then 'compacte'
    when 'intermediate' then 'intermediaire'
    else category
  end,
  fuel = case fuel
    when 'hybrid' then 'hybride'
    when 'electric' then 'electrique'
    else fuel
  end,
  transmission = case transmission
    when 'manual' then 'manuelle'
    when 'automatic' then 'automatique'
    else transmission
  end;

alter table public.cars
  drop constraint if exists cars_category_check,
  drop constraint if exists cars_fuel_check,
  drop constraint if exists cars_transmission_check,
  drop constraint if exists cars_year_check,
  drop constraint if exists cars_price_per_day_check,
  drop constraint if exists cars_active_public_requirements_check;

alter table public.cars
  add constraint cars_category_check
    check (category in ('economique', 'compacte', 'intermediaire', 'suv', 'premium')),
  add constraint cars_fuel_check
    check (fuel in ('essence', 'diesel', 'hybride', 'electrique')),
  add constraint cars_transmission_check
    check (transmission in ('manuelle', 'automatique')),
  add constraint cars_year_check
    check (year between 1900 and 2026),
  add constraint cars_price_per_day_check
    check (price_per_day is null or price_per_day between 1 and 100000),
  add constraint cars_active_public_requirements_check
    check (
      not active
      or (
        year between 2023 and 2026
        and price_per_day is not null
        and price_per_day > 0
        and image_url is not null
        and char_length(image_url) > 0
      )
    );

commit;
