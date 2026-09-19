begin;

alter table public.cars
  add column if not exists segment text;

alter table public.cars
  drop constraint if exists cars_category_check,
  drop constraint if exists cars_segment_check,
  drop constraint if exists cars_active_public_requirements_check;

alter table public.cars
  add constraint cars_category_check
    check (
      category = any (
        array[
          'economique'::text,
          'compacte'::text,
          'berline_routiere'::text,
          'suv'::text,
          'intermediaire'::text,
          'premium'::text
        ]
      )
    ),
  add constraint cars_segment_check
    check (
      segment is null
      or segment = any (
        array['segment_c'::text, 'suv_urbain'::text, 'suv_standard'::text]
      )
    );

create index if not exists cars_public_taxonomy_idx
  on public.cars (active, category, segment, sort_order);

commit;
