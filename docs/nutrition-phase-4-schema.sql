-- Phase 4 Nutrition Targets schema draft.
-- Documentation only: do not apply as a migration without reviewing project access rules.
-- If these tables are exposed through Supabase Data API, enable RLS and use
-- policies with `to authenticated` plus `(select auth.uid()) = user_id`.
-- New tables may also need explicit grants depending on project Data API settings.

create table if not exists public.nutrition_targets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  profile_id uuid not null,
  goal_type text not null,
  current_weight_kg numeric,
  goal_weight_kg numeric,
  goal_date date,
  activity_level text,
  training_days_per_week integer,
  main_workout_focus text,
  preferred_units text not null default 'metric',
  calories_target numeric not null default 0,
  protein_target_g numeric not null default 0,
  carbs_target_g numeric not null default 0,
  fat_target_g numeric not null default 0,
  fiber_target_g numeric,
  water_target_ml numeric not null default 0,
  workout_day_adjustment_json jsonb,
  rest_day_adjustment_json jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.nutrition_targets enable row level security;

-- If public.health_quick_widgets does not already exist when this phase is
-- migrated, this table shape is sufficient for the Health main bar preferences.
-- If it already exists, add only the missing fields or widget keys; do not
-- duplicate the table.
create table if not exists public.health_quick_widgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  profile_id uuid not null,
  widget_key text not null,
  title text not null,
  category text not null,
  is_pinned boolean not null default true,
  order_index integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.health_quick_widgets enable row level security;

-- Example ownership policies to adapt when applied:
-- create policy "Users can select own nutrition targets"
-- on public.nutrition_targets
-- for select
-- to authenticated
-- using ((select auth.uid()) = user_id);
--
-- create policy "Users can insert own nutrition targets"
-- on public.nutrition_targets
-- for insert
-- to authenticated
-- with check ((select auth.uid()) = user_id);
--
-- create policy "Users can update own nutrition targets"
-- on public.nutrition_targets
-- for update
-- to authenticated
-- using ((select auth.uid()) = user_id)
-- with check ((select auth.uid()) = user_id);
--
-- create policy "Users can delete own nutrition targets"
-- on public.nutrition_targets
-- for delete
-- to authenticated
-- using ((select auth.uid()) = user_id);
--
-- Repeat equivalent owner-scoped select/insert/update/delete policies for
-- health_quick_widgets if that table is applied in public.
