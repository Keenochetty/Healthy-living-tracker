-- Phase 20 Onboarding, Profile Setup + Personalization
-- Documentation-only SQL draft. Do not apply as a migration in Phase 20.
--
-- The current implementation is local-first with AsyncStorage. These tables
-- prepare future Supabase storage for resumable onboarding, user preferences,
-- module preferences, and profile setup metadata.
--
-- RLS guidance:
-- - Enable RLS on every public table.
-- - Scope policies TO authenticated.
-- - Use (select auth.uid()) = user_id for owner-scoped rows.
-- - UPDATE policies require both USING and WITH CHECK.
-- - New public tables may need explicit Data API grants before supabase-js can
--   access them, depending on project Data API settings.

create table if not exists public.onboarding_states (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  profile_id uuid,
  current_step text not null default 'welcome',
  completed_steps_json jsonb not null default '[]'::jsonb,
  skipped_steps_json jsonb not null default '[]'::jsonb,
  selected_modules_json jsonb not null default '[]'::jsonb,
  selected_widget_keys_json jsonb not null default '[]'::jsonb,
  privacy_choices_json jsonb not null default '{}'::jsonb,
  home_layout_preference text check (
    home_layout_preference in ('simple', 'family', 'fitness', 'baby_focused', 'medication_focused', 'custom')
  ),
  notification_choice text check (notification_choice in ('not_now', 'in_app_only', 'device_notifications')),
  ai_consent_completed boolean not null default false,
  family_setup_completed boolean not null default false,
  is_complete boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists onboarding_states_user_profile_idx
  on public.onboarding_states (user_id, coalesce(profile_id, '00000000-0000-0000-0000-000000000000'::uuid));

alter table public.onboarding_states enable row level security;

create policy "onboarding states owner select"
  on public.onboarding_states for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "onboarding states owner insert"
  on public.onboarding_states for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "onboarding states owner update"
  on public.onboarding_states for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create table if not exists public.user_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  country_code text,
  unit_system text not null default 'metric' check (unit_system in ('metric', 'imperial')),
  weight_unit text not null default 'kg' check (weight_unit in ('kg', 'lb')),
  length_unit text not null default 'cm' check (length_unit in ('cm', 'in')),
  volume_unit text not null default 'ml' check (volume_unit in ('ml', 'oz')),
  temperature_unit text check (temperature_unit in ('celsius', 'fahrenheit')),
  home_layout_preference text not null default 'simple' check (
    home_layout_preference in ('simple', 'family', 'fitness', 'baby_focused', 'medication_focused', 'custom')
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists user_preferences_user_idx
  on public.user_preferences (user_id);

alter table public.user_preferences enable row level security;

create policy "user preferences owner select"
  on public.user_preferences for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "user preferences owner insert"
  on public.user_preferences for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "user preferences owner update"
  on public.user_preferences for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create table if not exists public.module_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  profile_id uuid not null,
  module_key text not null,
  is_enabled boolean not null default false,
  enabled_at timestamptz,
  is_pinned_to_home boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists module_preferences_user_profile_module_idx
  on public.module_preferences (user_id, profile_id, module_key);

create index if not exists module_preferences_enabled_idx
  on public.module_preferences (user_id, profile_id, is_enabled);

alter table public.module_preferences enable row level security;

create policy "module preferences owner select"
  on public.module_preferences for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "module preferences owner insert"
  on public.module_preferences for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "module preferences owner update"
  on public.module_preferences for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- Optional future health_profiles extensions, if the table exists:
-- alter table public.health_profiles add column if not exists onboarding_completed boolean not null default false;
-- alter table public.health_profiles add column if not exists primary_goal text;
-- alter table public.health_profiles add column if not exists country_code text;
-- alter table public.health_profiles add column if not exists unit_system text;

-- Optional grants for projects where new public tables are not exposed
-- automatically to the Data API. Review before applying in production.
-- grant usage on schema public to authenticated;
-- grant select, insert, update on public.onboarding_states to authenticated;
-- grant select, insert, update on public.user_preferences to authenticated;
-- grant select, insert, update on public.module_preferences to authenticated;
