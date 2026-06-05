-- Phase 16 Men's Health Foundation schema draft.
-- Documentation only: do not apply this file as a migration in Phase 16.
-- Men's Health data is private by default and profile-scoped.
-- If these tables are later exposed through Supabase Data API, enable RLS first
-- and grant Data API access explicitly when project settings do not auto-expose
-- new public tables.

create table if not exists public.mens_health_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  profile_id uuid not null,
  status text not null default 'disabled',
  check_in_frequency text not null default 'weekly',
  default_privacy text not null default 'private',
  testicular_check_reminder_enabled boolean not null default false,
  prostate_discussion_reminder_enabled boolean not null default false,
  fertility_tracking_enabled boolean not null default false,
  sexual_health_notes_enabled boolean not null default false,
  enabled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint mens_health_settings_status_check
    check (status in ('disabled', 'enabled', 'shared_view_only')),
  constraint mens_health_settings_privacy_check
    check (default_privacy in ('private', 'shared_selected'))
);

create table if not exists public.mens_health_check_ins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  profile_id uuid not null,
  logged_at timestamptz not null default now(),
  energy text,
  stress text,
  sleep_quality text,
  mood text,
  libido_note text,
  sexual_health_note text,
  fertility_note text,
  urinary_note text,
  pain_discomfort_note text,
  workout_recovery_note text,
  notes text,
  is_private boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.mens_health_symptom_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  profile_id uuid not null,
  logged_at timestamptz not null default now(),
  symptom_key text not null,
  severity text,
  notes text,
  body_area text,
  related_record_id uuid,
  is_private boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.mens_health_reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  profile_id uuid not null,
  reminder_type text not null,
  title text not null,
  scheduled_at timestamptz not null,
  repeat_frequency text not null default 'none',
  status text not null default 'upcoming',
  notes text,
  related_question_id uuid,
  related_record_id uuid,
  is_private boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint mens_health_reminders_status_check
    check (status in ('upcoming', 'completed', 'skipped', 'snoozed', 'cancelled'))
);

create table if not exists public.mens_health_questions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  profile_id uuid not null,
  category text not null,
  question text not null,
  status text not null default 'draft',
  appointment_date date,
  answer_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint mens_health_questions_status_check
    check (status in ('draft', 'saved', 'asked', 'answered'))
);

create table if not exists public.mens_health_share_permissions (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null,
  user_id uuid not null,
  profile_id uuid not null,
  shared_with_user_id uuid,
  shared_with_profile_id uuid,
  category text not null,
  permission_level text not null default 'none',
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint mens_health_share_category_check
    check (category in ('overview', 'checkins', 'symptoms', 'fertility', 'sexual_health', 'reminders', 'questions', 'learn')),
  constraint mens_health_share_level_check
    check (permission_level in ('none', 'view', 'add', 'edit', 'manage'))
);

create index if not exists mens_health_settings_user_profile_idx
  on public.mens_health_settings (user_id, profile_id);
create index if not exists mens_health_check_ins_user_profile_logged_idx
  on public.mens_health_check_ins (user_id, profile_id, logged_at desc);
create index if not exists mens_health_symptoms_user_profile_logged_idx
  on public.mens_health_symptom_logs (user_id, profile_id, logged_at desc);
create index if not exists mens_health_reminders_user_profile_due_idx
  on public.mens_health_reminders (user_id, profile_id, scheduled_at);
create index if not exists mens_health_questions_user_profile_status_idx
  on public.mens_health_questions (user_id, profile_id, status);
create index if not exists mens_health_share_permissions_owner_idx
  on public.mens_health_share_permissions (owner_user_id, profile_id, category);

alter table public.mens_health_settings enable row level security;
alter table public.mens_health_check_ins enable row level security;
alter table public.mens_health_symptom_logs enable row level security;
alter table public.mens_health_reminders enable row level security;
alter table public.mens_health_questions enable row level security;
alter table public.mens_health_share_permissions enable row level security;

-- Owner policies. Keep `to authenticated` plus an ownership predicate.
create policy "Users can read their men's health settings"
  on public.mens_health_settings for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can insert their men's health settings"
  on public.mens_health_settings for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their men's health settings"
  on public.mens_health_settings for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- Repeat the same owner-only pattern for check-ins, symptom logs, reminders,
-- questions, and share-permission rows owned by the user.
-- Example for check-ins:
create policy "Users can read their men's health check-ins"
  on public.mens_health_check_ins for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can insert their men's health check-ins"
  on public.mens_health_check_ins for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their men's health check-ins"
  on public.mens_health_check_ins for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their men's health check-ins"
  on public.mens_health_check_ins for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- Shared access policies should be added later with explicit granted-access
-- predicates against mens_health_share_permissions or profile_permissions.
-- Do not use `to authenticated` without row-level ownership/access checks.

-- Future integration notes:
-- - health_reminders.source may use 'mens_health'.
-- - health_timeline_events.type/source may use 'mens_health'.
-- - trusted_health_content_cards may include source metadata for NHS, CDC,
--   Mayo Clinic, and Cleveland Clinic Men’s Health education cards.
-- - health_quick_widgets may include the Phase 16 widget keys and profile_id.

-- Data API grant notes for projects where public tables are not automatically exposed:
-- grant usage on schema public to authenticated;
-- grant select, insert, update, delete on public.mens_health_settings to authenticated;
-- grant select, insert, update, delete on public.mens_health_check_ins to authenticated;
-- grant select, insert, update, delete on public.mens_health_symptom_logs to authenticated;
-- grant select, insert, update, delete on public.mens_health_reminders to authenticated;
-- grant select, insert, update, delete on public.mens_health_questions to authenticated;
-- grant select, insert, update, delete on public.mens_health_share_permissions to authenticated;
