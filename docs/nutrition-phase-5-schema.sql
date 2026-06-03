-- Phase 5 Barcode Scanner + Packaged Product Lookup schema draft.
-- Documentation only: do not apply as a migration without reviewing project access rules.
-- If these tables are exposed through Supabase Data API, enable RLS and use
-- policies with `to authenticated` plus `(select auth.uid()) = user_id`.
-- New public tables may need explicit grants depending on project Data API settings.

create table if not exists public.barcode_products_cache (
  id uuid primary key default gen_random_uuid(),
  barcode text not null unique,
  source text not null,
  source_food_id text not null,
  name text not null,
  brand text,
  image_url text,
  serving_size numeric,
  serving_unit text,
  calories numeric,
  protein_g numeric,
  carbs_g numeric,
  fat_g numeric,
  fiber_g numeric,
  sugar_g numeric,
  sodium_mg numeric,
  ingredients text,
  allergens_json jsonb,
  nutrients_json jsonb,
  data_quality text not null default 'unknown',
  raw_source_json jsonb,
  last_fetched_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.recently_scanned_products (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  profile_id uuid not null,
  barcode text not null,
  source text not null,
  source_food_id text not null,
  product_name text not null,
  brand text,
  image_url text,
  calories numeric,
  last_scanned_at timestamptz not null default now(),
  times_scanned integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.barcode_products_cache enable row level security;
alter table public.recently_scanned_products enable row level security;

-- Optional future column additions if nutrition_diary_entries exists in Supabase:
-- alter table public.nutrition_diary_entries add column if not exists barcode text;
-- alter table public.nutrition_diary_entries add column if not exists source text;
-- alter table public.nutrition_diary_entries add column if not exists source_food_id text;
-- alter table public.nutrition_diary_entries add column if not exists brand text;
-- alter table public.nutrition_diary_entries add column if not exists image_url text;
-- alter table public.nutrition_diary_entries add column if not exists ingredients text;
-- alter table public.nutrition_diary_entries add column if not exists allergens_json jsonb;

-- Optional future column additions if custom_foods is missing Phase 3 fields:
-- alter table public.custom_foods add column if not exists barcode text;
-- alter table public.custom_foods add column if not exists image_url text;

-- Example ownership policies to adapt when applied:
-- create policy "Users can select own recently scanned products"
-- on public.recently_scanned_products
-- for select
-- to authenticated
-- using ((select auth.uid()) = user_id);
--
-- create policy "Users can insert own recently scanned products"
-- on public.recently_scanned_products
-- for insert
-- to authenticated
-- with check ((select auth.uid()) = user_id);
--
-- create policy "Users can update own recently scanned products"
-- on public.recently_scanned_products
-- for update
-- to authenticated
-- using ((select auth.uid()) = user_id)
-- with check ((select auth.uid()) = user_id);
--
-- barcode_products_cache can be app-readable shared cache, but do not expose
-- writes broadly. If exposed later, define narrow authenticated policies or
-- move writes behind a Supabase Edge Function.
