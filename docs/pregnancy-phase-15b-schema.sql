-- Phase 15B Pregnancy Mode Foundation
-- Documentation-only SQL draft. Do not apply as a migration in Phase 15B.
-- Pregnancy Mode is private by default and must not diagnose or provide medical advice.
-- RLS policies should use TO authenticated plus ownership predicates:
--   (select auth.uid()) = user_id
-- New public tables may require explicit Data API grants before supabase-js can access them.

create table if not exists public.pregnancy_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  profile_id uuid not null,
  status text not null default 'disabled',
  date_basis text not null default 'manual',
  last_menstrual_period_date date,
  estimated_due_date date,
  conception_date date,
  ivf_date date,
  pregnancy_type text,
  provider_name text,
  clinic_name text,
  privacy text not null default 'private',
  activated_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.pregnancy_appointments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  profile_id uuid not null,
  pregnancy_profile_id uuid not null,
  title text not null,
  appointment_type text not null,
  provider text,
  practitioner text,
  scheduled_at timestamptz not null,
  location text,
  notes text,
  questions_to_ask text,
  instructions_received text,
  follow_up_date date,
  related_document_ids_json jsonb not null default '[]'::jsonb,
  is_private boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.pregnancy_symptom_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  profile_id uuid not null,
  pregnancy_profile_id uuid not null,
  symptom_key text not null,
  severity text,
  severity_score integer,
  notes text,
  logged_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.pregnancy_questions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  profile_id uuid not null,
  pregnancy_profile_id uuid not null,
  question text not null,
  category text not null,
  related_appointment_id uuid,
  related_medication_id uuid,
  related_supplement_id uuid,
  status text not null default 'draft',
  answer_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.pregnancy_share_permissions (
  id uuid primary key default gen_random_uuid(),
  owner_profile_id uuid not null,
  shared_with_user_id uuid,
  shared_with_profile_id uuid,
  category text not null,
  permission_level text not null default 'none',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Expected future extensions:
-- alter table public.health_reminders add column if not exists pregnancy_source_type text;
-- alter table public.health_timeline_events add column if not exists pregnancy_source_type text;
-- alter table public.trusted_health_content_cards add column if not exists pregnancy_category text;
-- alter table public.health_quick_widgets add column if not exists pregnancy_widget_category text;

create index if not exists pregnancy_profiles_owner_idx on public.pregnancy_profiles (user_id, profile_id);
create index if not exists pregnancy_appointments_profile_date_idx on public.pregnancy_appointments (profile_id, scheduled_at);
create index if not exists pregnancy_symptom_logs_profile_date_idx on public.pregnancy_symptom_logs (profile_id, logged_at desc);
create index if not exists pregnancy_questions_profile_status_idx on public.pregnancy_questions (profile_id, status);
create index if not exists pregnancy_share_permissions_owner_idx on public.pregnancy_share_permissions (owner_profile_id, category);

alter table public.pregnancy_profiles enable row level security;
alter table public.pregnancy_appointments enable row level security;
alter table public.pregnancy_symptom_logs enable row level security;
alter table public.pregnancy_questions enable row level security;
alter table public.pregnancy_share_permissions enable row level security;

-- Example policy pattern for user-owned pregnancy tables:
-- create policy "Users can read their pregnancy profiles"
-- on public.pregnancy_profiles for select
-- to authenticated
-- using ((select auth.uid()) = user_id);
--
-- create policy "Users can insert their pregnancy profiles"
-- on public.pregnancy_profiles for insert
-- to authenticated
-- with check ((select auth.uid()) = user_id);
--
-- create policy "Users can update their pregnancy profiles"
-- on public.pregnancy_profiles for update
-- to authenticated
-- using ((select auth.uid()) = user_id)
-- with check ((select auth.uid()) = user_id);
--
-- Shared-view policies should additionally check explicit granted access
-- through pregnancy_share_permissions or a future normalized profile access table.
