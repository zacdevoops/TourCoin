begin;

-- The booking snapshot remains intact because booking_requests.car_id uses
-- ON DELETE SET NULL and stores the historical vehicle identity separately.
delete from public.cars
where
  (lower(brand) = 'kia' and lower(model) = 'picanto')
  or (lower(brand) = 'hyundai' and lower(model) = 'i10')
  or (lower(brand) = 'suzuki' and lower(model) = 'swift')
  or (lower(brand) = 'fiat' and lower(model) in ('500', '500e'));

-- Prevent an older vehicle from remaining publicly visible during migration.
update public.cars
set active = false
where year not between 2023 and 2026;

create type public.car_category_v2 as enum (
  'economique',
  'compacte',
  'intermediaire',
  'suv',
  'premium'
);

alter table public.cars
  alter column category type public.car_category_v2
  using (
    case category::text
      when 'citadine' then 'economique'
      when 'berline' then 'intermediaire'
      else category::text
    end
  )::public.car_category_v2;

drop type public.car_category;
alter type public.car_category_v2 rename to car_category;

alter table public.cars drop constraint if exists cars_year_check;
alter table public.cars
  add constraint cars_year_check check (year between 2023 and 2026);

commit;
