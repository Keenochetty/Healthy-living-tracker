-- Phase 15A Women's Health + Cycle + Contraception Foundation
-- Documentation-only SQL draft. Do not apply as a migration in Phase 15A.
-- Tables are designed for local-first data to move to Supabase later.
-- RLS policies must use TO authenticated plus ownership predicates such as:
--   (select auth.uid()) = user_id
-- New public tables may require explicit Data API grants before supabase-js can access them.

create table if not exists public.womens_health_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  profile_id uuid not null,
  feature_status text not null default 'disabled',
  tracking_enabled boolean not null default false,
  overlay_enabled boolean not null default true,
  is_private boolean not null default true,
  locked_private boolean not null default true,
  shared_with_partner boolean not null default false,
  shared_with_family boolean not null default false,
  shared_with_caregiver boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cycle_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  profile_id uuid not null,
  last_period_start_date date,
  typical_cycle_length_days integer not null default 28,
  typical_period_length_days integer not null default 5,
  is_cycle_regular boolean,
  fertility_estimates_enabled boolean not null default true,
  ovulation_test_tracking_enabled boolean not null default false,
  pregnancy_test_tracking_enabled boolean not null default false,
  contraception_tracking_enabled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.period_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  profile_id uuid not null,
  log_date date not null,
  flow_level text not null,
  cramps_level integer,
  pain_level integer,
  clots_note text,
  medication_note text,
  mood text,
  energy_level integer,
  notes text,
  is_private boolean not null default true,
  locked_private boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.womens_symptom_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  profile_id uuid not null,
  log_date date not null,
  symptom text not null,
  severity text not null,
  notes text,
  is_private boolean not null default true,
  locked_private boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.mood_energy_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  profile_id uuid not null,
  log_date date not null,
  mood text,
  energy_level integer,
  notes text,
  is_private boolean not null default true,
  locked_private boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cycle_estimates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  profile_id uuid not null,
  cycle_day integer,
  next_period_start date,
  next_period_end date,
  fertile_window_start date,
  fertile_window_end date,
  estimated_ovulation_date date,
  confidence text not null default 'low',
  estimate_only boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.contraception_methods (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  profile_id uuid not null,
  method_type text not null,
  name text not null,
  started_at date,
  next_due_at timestamptz,
  reminder_enabled boolean not null default false,
  reminder_time text,
  food_timing_note text,
  notes text,
  is_active boolean not null default true,
  is_private boolean not null default true,
  locked_private boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.contraception_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  profile_id uuid not null,
  contraception_method_id uuid,
  event_type text not null,
  event_at timestamptz not null,
  notes text,
  is_private boolean not null default true,
  locked_private boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.womens_health_share_permissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  profile_id uuid not null,
  viewer_type text not null,
  category text not null,
  permission_level text not null default 'none',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.calendar_halo_overlays (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  profile_id uuid not null,
  overlay_date date not null,
  overlay_type text not null,
  label text not null,
  color text,
  related_id uuid,
  is_shared boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.trusted_health_content_cards (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  summary text not null,
  source_name text not null,
  source_url text not null,
  author_or_reviewer text,
  published_at timestamptz,
  reviewed_at timestamptz,
  last_checked_at timestamptz not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Expected future extensions:
-- alter table public.health_reminders add column if not exists womens_health_source_type text;
-- alter table public.health_quick_widgets add column if not exists permission_required text;

create index if not exists womens_health_settings_owner_idx on public.womens_health_settings (user_id, profile_id);
create index if not exists period_logs_profile_date_idx on public.period_logs (profile_id, log_date desc);
create index if not exists womens_symptom_logs_profile_date_idx on public.womens_symptom_logs (profile_id, log_date desc);
create index if not exists mood_energy_logs_profile_date_idx on public.mood_energy_logs (profile_id, log_date desc);
create index if not exists contraception_methods_profile_idx on public.contraception_methods (profile_id, is_active);
create index if not exists contraception_logs_profile_event_idx on public.contraception_logs (profile_id, event_at desc);
create index if not exists calendar_halo_overlays_date_idx on public.calendar_halo_overlays (profile_id, overlay_date);

alter table public.womens_health_settings enable row level security;
alter table public.cycle_profiles enable row level security;
alter table public.period_logs enable row level security;
alter table public.womens_symptom_logs enable row level security;
alter table public.mood_energy_logs enable row level security;
alter table public.cycle_estimates enable row level security;
alter table public.contraception_methods enable row level security;
alter table public.contraception_logs enable row level security;
alter table public.womens_health_share_permissions enable row level security;
alter table public.calendar_halo_overlays enable row level security;

-- Example ownership policy pattern for each user-owned table:
-- create policy "Users can read their womens health rows"
-- on public.period_logs for select
-- to authenticated
-- using ((select auth.uid()) = user_id);
--
-- create policy "Users can write their womens health rows"
-- on public.period_logs for insert
-- to authenticated
-- with check ((select auth.uid()) = user_id);
--
-- create policy "Users can update their womens health rows"
-- on public.period_logs for update
-- to authenticated
-- using ((select auth.uid()) = user_id)
-- with check ((select auth.uid()) = user_id);

