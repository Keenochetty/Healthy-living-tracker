-- Phase 7 Biometrics Connection schema draft.
-- Documentation only: do not apply this as a migration during Phase 7.
-- Biometrics remain local-first in AsyncStorage for now.

create table if not exists public.biometric_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  profile_id uuid not null,
  type text not null check (
    type in (
      'weight',
      'body_measurement',
      'sleep',
      'heart_rate',
      'blood_pressure',
      'blood_glucose',
      'energy',
      'mood',
      'digestion',
      'symptom'
    )
  ),
  value numeric,
  unit text,
  secondary_value numeric,
  secondary_unit text,
  label text,
  severity integer check (severity is null or (severity >= 1 and severity <= 10)),
  quality text,
  notes text,
  metadata_json jsonb not null default '{}'::jsonb,
  visibility text not null default 'private' check (visibility in ('private', 'shared')),
  shared_with_partner boolean not null default false,
  shared_with_family boolean not null default false,
  shared_with_caregiver boolean not null default false,
  locked_private boolean not null default true,
  logged_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.body_measurement_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  profile_id uuid not null,
  waist_cm numeric,
  chest_cm numeric,
  arm_cm numeric,
  thigh_cm numeric,
  hip_cm numeric,
  body_fat_percentage numeric,
  photo_url text,
  notes text,
  visibility text not null default 'private' check (visibility in ('private', 'shared')),
  shared_with_partner boolean not null default false,
  shared_with_family boolean not null default false,
  shared_with_caregiver boolean not null default false,
  locked_private boolean not null default true,
  logged_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.sleep_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  profile_id uuid not null,
  duration_minutes integer not null check (duration_minutes > 0),
  sleep_quality text check (sleep_quality is null or sleep_quality in ('poor', 'okay', 'good', 'great')),
  bedtime timestamptz,
  wake_time timestamptz,
  notes text,
  visibility text not null default 'private' check (visibility in ('private', 'shared')),
  shared_with_partner boolean not null default false,
  shared_with_family boolean not null default false,
  shared_with_caregiver boolean not null default false,
  locked_private boolean not null default true,
  logged_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.blood_pressure_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  profile_id uuid not null,
  systolic integer not null check (systolic > 0),
  diastolic integer not null check (diastolic > 0),
  pulse integer check (pulse is null or pulse > 0),
  notes text,
  visibility text not null default 'private' check (visibility in ('private', 'shared')),
  shared_with_partner boolean not null default false,
  shared_with_family boolean not null default false,
  shared_with_caregiver boolean not null default false,
  locked_private boolean not null default true,
  logged_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.blood_glucose_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  profile_id uuid not null,
  glucose_value numeric not null check (glucose_value > 0),
  unit text not null default 'mmol/L' check (unit in ('mmol/L', 'mg/dL')),
  timing text not null check (timing in ('fasting', 'before_meal', 'after_meal', 'bedtime', 'other')),
  notes text,
  visibility text not null default 'private' check (visibility in ('private', 'shared')),
  shared_with_partner boolean not null default false,
  shared_with_family boolean not null default false,
  shared_with_caregiver boolean not null default false,
  locked_private boolean not null default true,
  logged_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists biometric_logs_user_profile_type_logged_idx
  on public.biometric_logs (user_id, profile_id, type, logged_at desc);

create index if not exists body_measurement_logs_user_profile_logged_idx
  on public.body_measurement_logs (user_id, profile_id, logged_at desc);

create index if not exists sleep_logs_user_profile_logged_idx
  on public.sleep_logs (user_id, profile_id, logged_at desc);

create index if not exists blood_pressure_logs_user_profile_logged_idx
  on public.blood_pressure_logs (user_id, profile_id, logged_at desc);

create index if not exists blood_glucose_logs_user_profile_logged_idx
  on public.blood_glucose_logs (user_id, profile_id, logged_at desc);

alter table public.biometric_logs enable row level security;
alter table public.body_measurement_logs enable row level security;
alter table public.sleep_logs enable row level security;
alter table public.blood_pressure_logs enable row level security;
alter table public.blood_glucose_logs enable row level security;

-- RLS policy requirements when these tables are applied later:
-- Use explicit role targets and ownership predicates. Do not use auth.role().
-- Example for each table:
--
-- create policy "biometric logs select own"
--   on public.biometric_logs
--   for select
--   to authenticated
--   using ((select auth.uid()) = user_id);
--
-- create policy "biometric logs insert own"
--   on public.biometric_logs
--   for insert
--   to authenticated
--   with check ((select auth.uid()) = user_id);
--
-- create policy "biometric logs update own"
--   on public.biometric_logs
--   for update
--   to authenticated
--   using ((select auth.uid()) = user_id)
--   with check ((select auth.uid()) = user_id);
--
-- create policy "biometric logs delete own"
--   on public.biometric_logs
--   for delete
--   to authenticated
--   using ((select auth.uid()) = user_id);

-- Biometrics are sensitive. Keep anon access disabled.
-- Depending on Supabase project Data API settings, new public tables may not be
-- exposed to REST/GraphQL automatically. If these tables are intentionally used
-- through supabase-js later, grant only the minimum required privileges to
-- authenticated after RLS is enabled and policies are in place.
