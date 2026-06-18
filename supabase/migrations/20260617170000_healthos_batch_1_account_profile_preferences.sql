-- HealthOS Batch 1: account, onboarding, app, and notification preference foundation.
-- Additive draft only. Do not apply remotely until reviewed.

alter table public.profiles
  add column if not exists avatar_storage_path text,
  add column if not exists profile_completed boolean not null default false,
  add column if not exists locale text;

comment on column public.profiles.avatar_storage_path is
  'Private profile avatar storage path. Do not expose raw paths in UI.';

create table if not exists public.onboarding_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  setup_completed boolean not null default false,
  selected_goals text[] not null default '{}',
  selected_modules text[] not null default '{}',
  gender_context text,
  life_stage_context text[] not null default '{}',
  family_setup_intent text,
  fitness_goal text,
  nutrition_goal text,
  pregnancy_interest boolean not null default false,
  baby_child_interest boolean not null default false,
  caregiver_interest boolean not null default false,
  daily_planning_interest boolean not null default false,
  skipped_steps text[] not null default '{}',
  completed_steps text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id)
);

create table if not exists public.app_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  theme_mode text not null default 'system',
  accent_style text,
  reduced_motion boolean not null default false,
  haptics_enabled boolean not null default true,
  units_system text not null default 'metric',
  time_format text not null default '24h',
  start_screen text not null default 'home',
  ai_private_mode boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id),
  check (theme_mode in ('system', 'light', 'dark')),
  check (units_system in ('metric', 'imperial')),
  check (time_format in ('12h', '24h'))
);

create table if not exists public.notification_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  master_enabled boolean not null default false,
  medication_enabled boolean not null default false,
  supplements_enabled boolean not null default false,
  calendar_enabled boolean not null default true,
  pregnancy_enabled boolean not null default false,
  baby_child_enabled boolean not null default false,
  womens_health_enabled boolean not null default false,
  family_enabled boolean not null default true,
  caregiver_enabled boolean not null default false,
  records_review_enabled boolean not null default true,
  ai_import_review_enabled boolean not null default true,
  fitness_enabled boolean not null default false,
  nutrition_enabled boolean not null default false,
  security_alerts_enabled boolean not null default true,
  quiet_hours_enabled boolean not null default false,
  quiet_hours_start text,
  quiet_hours_end text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id)
);

create index if not exists onboarding_preferences_user_id_idx
  on public.onboarding_preferences(user_id);
create index if not exists app_preferences_user_id_idx
  on public.app_preferences(user_id);
create index if not exists notification_preferences_user_id_idx
  on public.notification_preferences(user_id);

alter table public.onboarding_preferences enable row level security;
alter table public.app_preferences enable row level security;
alter table public.notification_preferences enable row level security;

grant select, insert, update on public.onboarding_preferences to authenticated;
grant select, insert, update on public.app_preferences to authenticated;
grant select, insert, update on public.notification_preferences to authenticated;

drop policy if exists "Users can read own onboarding preferences" on public.onboarding_preferences;
create policy "Users can read own onboarding preferences"
on public.onboarding_preferences
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert own onboarding preferences" on public.onboarding_preferences;
create policy "Users can insert own onboarding preferences"
on public.onboarding_preferences
for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update own onboarding preferences" on public.onboarding_preferences;
create policy "Users can update own onboarding preferences"
on public.onboarding_preferences
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can read own app preferences" on public.app_preferences;
create policy "Users can read own app preferences"
on public.app_preferences
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert own app preferences" on public.app_preferences;
create policy "Users can insert own app preferences"
on public.app_preferences
for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update own app preferences" on public.app_preferences;
create policy "Users can update own app preferences"
on public.app_preferences
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can read own notification preferences" on public.notification_preferences;
create policy "Users can read own notification preferences"
on public.notification_preferences
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert own notification preferences" on public.notification_preferences;
create policy "Users can insert own notification preferences"
on public.notification_preferences
for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update own notification preferences" on public.notification_preferences;
create policy "Users can update own notification preferences"
on public.notification_preferences
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

comment on table public.onboarding_preferences is
  'HealthOS Batch 1 account-level onboarding preferences. Stores preferences, not diagnoses.';
comment on table public.app_preferences is
  'HealthOS Batch 1 account-level app display and privacy preferences.';
comment on table public.notification_preferences is
  'HealthOS Batch 1 notification category preferences only. Does not schedule notifications.';

