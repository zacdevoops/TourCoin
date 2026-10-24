-- Vehicles with no published daily rate can still receive booking requests.
-- The price snapshot remains NULL until the Tourcoin team confirms the tariff.
alter table public.booking_requests
  alter column car_price_per_day drop not null;

alter table public.booking_requests
  drop constraint if exists booking_requests_car_price_per_day_check;

alter table public.booking_requests
  add constraint booking_requests_car_price_per_day_check
  check (car_price_per_day is null or car_price_per_day > 0);
