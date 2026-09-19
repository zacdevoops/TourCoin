-- Align live cars vocabulary with the new Tourcoin app without recreating the table.

alter table public.cars drop constraint if exists cars_category_check;
alter table public.cars drop constraint if exists cars_transmission_check;

update public.cars
set
  category = case category
    when 'mini' then 'economique'
    when 'economy' then 'economique'
    when 'compact' then 'compacte'
    when 'citadine' then 'economique'
    when 'intermediate' then 'intermediaire'
    when 'berline' then 'intermediaire'
    else category
  end,
  transmission = case transmission
    when 'manual' then 'manuelle'
    when 'automatic' then 'automatique'
    else transmission
  end;

alter table public.cars
  add constraint cars_category_check
  check (category = any (array['economique'::text, 'compacte'::text, 'intermediaire'::text, 'suv'::text, 'premium'::text]));

alter table public.cars
  add constraint cars_transmission_check
  check (transmission = any (array['manuelle'::text, 'automatique'::text]));
