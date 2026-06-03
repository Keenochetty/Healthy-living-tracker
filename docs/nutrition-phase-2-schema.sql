-- Phase 2 Nutrition Search schema draft.
-- Do not apply directly without reviewing project access rules.
-- If these tables are exposed through Supabase Data API, enable RLS and use
-- policies with `to authenticated` plus `(select auth.uid()) = user_id`.
-- New tables may also need explicit grants depending on project Data API settings.

create table if not exists public.foods (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  source_food_id text not null,
  name text not null,
  brand text,
  description text,
  image_url text,
  default_serving_size numeric not null default 1,
  default_serving_unit text not null default 'serving',
  calories numeric not null default 0,
  protein_g numeric not null default 0,
  carbs_g numeric not null default 0,
  fat_g numeric not null default 0,
  fiber_g numeric,
  sugar_g numeric,
  sodium_mg numeric,
  nutrients_json jsonb,
  data_quality text default 'unknown',
  verified boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(source, source_food_id)
);

create table if not exists public.recent_foods (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  profile_id uuid not null,
  food_name text not null,
  source text not null,
  source_food_id text not null,
  brand text,
  default_meal_group text not null,
  default_quantity numeric not null default 1,
  default_unit text not null default 'serving',
  times_used integer not null default 1,
  last_used_at timestamptz not null default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, profile_id, source, source_food_id)
);

create table if not exists public.favourite_foods (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  profile_id uuid not null,
  food_name text not null,
  source text not null,
  source_food_id text not null,
  brand text,
  default_quantity numeric not null default 1,
  default_unit text not null default 'serving',
  created_at timestamptz default now(),
  unique(user_id, profile_id, source, source_food_id)
);

alter table public.foods enable row level security;
alter table public.recent_foods enable row level security;
alter table public.favourite_foods enable row level security;

-- Example ownership policies to adapt when this schema is applied:
-- create policy "Users can select own recent foods"
-- on public.recent_foods
-- for select
-- to authenticated
-- using ((select auth.uid()) = user_id);
--
-- create policy "Users can insert own recent foods"
-- on public.recent_foods
-- for insert
-- to authenticated
-- with check ((select auth.uid()) = user_id);
--
-- create policy "Users can update own recent foods"
-- on public.recent_foods
-- for update
-- to authenticated
-- using ((select auth.uid()) = user_id)
-- with check ((select auth.uid()) = user_id);
--
-- create policy "Users can delete own favourite foods"
-- on public.favourite_foods
-- for delete
-- to authenticated
-- using ((select auth.uid()) = user_id);
