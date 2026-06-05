-- Phase 15C Baby / Child Growth Foundation schema draft.
-- Documentation only: do not apply in Phase 15C.
-- All child health data is private by default and parent/guardian managed.
-- If applied later, enable RLS and use policies scoped with `to authenticated`
-- plus `(select auth.uid()) = user_id` or explicit granted-access predicates.
-- New public tables may require explicit Data API grants before supabase-js can access them.

create table if not exists public.baby_child_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  profile_id uuid not null,
  parent_guardian_user_id uuid not null,
  display_name text not null,
  date_of_birth date not null,
  due_date date,
  sex text check (sex in ('female', 'male', 'intersex', 'prefer_not_to_say')),
  birth_weight_kg numeric,
  birth_length_cm numeric,
  birth_head_circumference_cm numeric,
  feeding_type text,
  pediatrician_name text,
  clinic_name text,
  medical_notes text,
  privacy text not null default 'private',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.baby_feeding_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  profile_id uuid not null,
  child_profile_id uuid not null references public.baby_child_profiles(id) on delete cascade,
  feeding_type text not null,
  started_at timestamptz not null,
  ended_at timestamptz,
  duration_minutes integer,
  side text,
  amount_ml numeric,
  food_name text,
  texture text,
  reaction_note text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.baby_sleep_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  profile_id uuid not null,
  child_profile_id uuid not null references public.baby_child_profiles(id) on delete cascade,
  started_at timestamptz not null,
  ended_at timestamptz,
  duration_minutes integer,
  sleep_type text,
  sleep_location text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.baby_diaper_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  profile_id uuid not null,
  child_profile_id uuid not null references public.baby_child_profiles(id) on delete cascade,
  diaper_type text not null,
  logged_at timestamptz not null,
  color text,
  texture text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.baby_growth_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  profile_id uuid not null,
  child_profile_id uuid not null references public.baby_child_profiles(id) on delete cascade,
  weight_kg numeric,
  length_cm numeric,
  head_circumference_cm numeric,
  measured_at timestamptz not null,
  measurement_source text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.baby_milestones (
  id uuid primary key default gen_random_uuid(),
  child_profile_id uuid,
  age_checkpoint_months integer not null,
  category text not null,
  title text not null,
  source_organization text not null,
  source_url text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.baby_milestone_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  profile_id uuid not null,
  child_profile_id uuid not null references public.baby_child_profiles(id) on delete cascade,
  milestone_id uuid,
  status text not null check (status in ('observed', 'not_yet', 'unsure')),
  observed_date date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.baby_solid_food_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  profile_id uuid not null,
  child_profile_id uuid not null references public.baby_child_profiles(id) on delete cascade,
  food_name text not null,
  tried_at timestamptz not null,
  texture text,
  preparation_notes text,
  reaction_note text,
  allergen_category text,
  liked_status text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.baby_medicine_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  profile_id uuid not null,
  child_profile_id uuid not null references public.baby_child_profiles(id) on delete cascade,
  medicine_name text not null,
  prescribed_by text,
  dose_instruction text,
  status text not null,
  logged_at timestamptz not null,
  expiry_date date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.baby_vaccine_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  profile_id uuid not null,
  child_profile_id uuid not null references public.baby_child_profiles(id) on delete cascade,
  vaccine_name text not null,
  dose_number text,
  date_received date,
  clinic_location text,
  batch_number text,
  next_dose_date date,
  document_id uuid,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Future extensions:
-- health_reminders.source/source_type should allow `baby_child`.
-- health_timeline_events.type/source should allow `baby_child`.
-- health_quick_widgets should allow baby widget keys and profile-scoped visibility.
-- trusted_health_content_cards should allow category `baby_child`.

create index if not exists baby_child_profiles_user_profile_idx on public.baby_child_profiles(user_id, profile_id);
create index if not exists baby_feeding_logs_child_started_idx on public.baby_feeding_logs(child_profile_id, started_at desc);
create index if not exists baby_sleep_logs_child_started_idx on public.baby_sleep_logs(child_profile_id, started_at desc);
create index if not exists baby_diaper_logs_child_logged_idx on public.baby_diaper_logs(child_profile_id, logged_at desc);
create index if not exists baby_growth_logs_child_measured_idx on public.baby_growth_logs(child_profile_id, measured_at desc);
create index if not exists baby_milestone_logs_child_idx on public.baby_milestone_logs(child_profile_id);
create index if not exists baby_solid_food_logs_child_tried_idx on public.baby_solid_food_logs(child_profile_id, tried_at desc);
create index if not exists baby_medicine_logs_child_logged_idx on public.baby_medicine_logs(child_profile_id, logged_at desc);
create index if not exists baby_vaccine_records_child_next_idx on public.baby_vaccine_records(child_profile_id, next_dose_date);

alter table public.baby_child_profiles enable row level security;
alter table public.baby_feeding_logs enable row level security;
alter table public.baby_sleep_logs enable row level security;
alter table public.baby_diaper_logs enable row level security;
alter table public.baby_growth_logs enable row level security;
alter table public.baby_milestone_logs enable row level security;
alter table public.baby_solid_food_logs enable row level security;
alter table public.baby_medicine_logs enable row level security;
alter table public.baby_vaccine_records enable row level security;

-- Example owner policy pattern for each user-owned table:
-- create policy "owners can select baby_child_profiles"
-- on public.baby_child_profiles for select
-- to authenticated
-- using ((select auth.uid()) = user_id);
--
-- create policy "owners can insert baby_child_profiles"
-- on public.baby_child_profiles for insert
-- to authenticated
-- with check ((select auth.uid()) = user_id);
--
-- create policy "owners can update baby_child_profiles"
-- on public.baby_child_profiles for update
-- to authenticated
-- using ((select auth.uid()) = user_id)
-- with check ((select auth.uid()) = user_id);
--
-- create policy "owners can delete baby_child_profiles"
-- on public.baby_child_profiles for delete
-- to authenticated
-- using ((select auth.uid()) = user_id);

-- If Data API automatic exposure is disabled, grant table access explicitly after RLS:
-- grant select, insert, update, delete on public.baby_child_profiles to authenticated;
-- Repeat grants only for tables and roles intended to be reachable by the client.
