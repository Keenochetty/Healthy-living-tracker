-- Phase 3 Nutrition Library schema draft.
-- Do not apply directly without reviewing project access rules.
-- If these tables are exposed through Supabase Data API, enable RLS and use
-- policies with `to authenticated` plus `(select auth.uid()) = user_id`.
-- New tables may also need explicit grants depending on project Data API settings.

create table if not exists public.custom_foods (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  profile_id uuid not null,
  name text not null,
  brand text,
  barcode text,
  serving_size numeric not null,
  serving_unit text not null,
  calories numeric not null default 0,
  protein_g numeric not null default 0,
  carbs_g numeric not null default 0,
  fat_g numeric not null default 0,
  fiber_g numeric,
  sugar_g numeric,
  sodium_mg numeric,
  potassium_mg numeric,
  calcium_mg numeric,
  iron_mg numeric,
  vitamin_a_mcg numeric,
  vitamin_c_mg numeric,
  vitamin_d_mcg numeric,
  notes text,
  image_url text,
  is_shared_with_family boolean not null default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.saved_meals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  profile_id uuid not null,
  name text not null,
  default_meal_group text not null,
  description text,
  is_shared_with_family boolean not null default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.saved_meal_items (
  id uuid primary key default gen_random_uuid(),
  saved_meal_id uuid not null references public.saved_meals(id) on delete cascade,
  food_source text not null,
  source_food_id text not null,
  custom_food_id uuid references public.custom_foods(id) on delete set null,
  food_name text not null,
  quantity numeric not null default 1,
  unit text not null default 'serving',
  calories numeric not null default 0,
  protein_g numeric not null default 0,
  carbs_g numeric not null default 0,
  fat_g numeric not null default 0,
  order_index integer not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.recipes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  profile_id uuid not null,
  name text not null,
  description text,
  servings numeric not null default 1,
  prep_time_minutes integer,
  cook_time_minutes integer,
  instructions text,
  image_url text,
  is_shared_with_family boolean not null default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.recipe_ingredients (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references public.recipes(id) on delete cascade,
  food_source text not null,
  source_food_id text not null,
  custom_food_id uuid references public.custom_foods(id) on delete set null,
  food_name text not null,
  quantity numeric not null default 1,
  unit text not null default 'serving',
  calories numeric not null default 0,
  protein_g numeric not null default 0,
  carbs_g numeric not null default 0,
  fat_g numeric not null default 0,
  notes text,
  order_index integer not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.custom_foods enable row level security;
alter table public.saved_meals enable row level security;
alter table public.saved_meal_items enable row level security;
alter table public.recipes enable row level security;
alter table public.recipe_ingredients enable row level security;

-- Example ownership policies to adapt when applied:
-- create policy "Users can select own custom foods"
-- on public.custom_foods
-- for select
-- to authenticated
-- using ((select auth.uid()) = user_id);
--
-- create policy "Users can insert own custom foods"
-- on public.custom_foods
-- for insert
-- to authenticated
-- with check ((select auth.uid()) = user_id);
--
-- create policy "Users can update own custom foods"
-- on public.custom_foods
-- for update
-- to authenticated
-- using ((select auth.uid()) = user_id)
-- with check ((select auth.uid()) = user_id);
--
-- For child tables, use joins or duplicated ownership columns before exposing
-- through the Data API, so item/ingredient access is constrained to the owner
-- of the parent saved meal or recipe.
