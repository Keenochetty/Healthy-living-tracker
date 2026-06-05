-- Phase 19 Notifications, Reminders + Local Scheduling Hardening
-- Documentation-only SQL draft. Do not apply as a migration in Phase 19.
--
-- Local-first implementation uses AsyncStorage and Expo local notifications.
-- These tables prepare future Supabase storage for notification settings,
-- category settings, scheduled local notification bookkeeping, and action logs.
--
-- RLS guidance:
-- - Enable RLS on every table in public.
-- - Scope policies TO authenticated.
-- - Use (select auth.uid()) = user_id for owner-scoped rows.
-- - UPDATE policies need both USING and WITH CHECK.
-- - New public tables may need explicit Data API grants before supabase-js
--   can access them, depending on project settings.

create table if not exists public.notification_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  notifications_enabled boolean not null default false,
  permission_status text not null default 'not_requested' check (
    permission_status in ('not_requested', 'granted', 'denied', 'provisional', 'unavailable')
  ),
  quiet_hours_enabled boolean not null default false,
  quiet_hours_start text,
  quiet_hours_end text,
  sensitive_lock_screen_private boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists notification_settings_user_idx
  on public.notification_settings (user_id);

alter table public.notification_settings enable row level security;

create policy "notification settings owner select"
  on public.notification_settings for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "notification settings owner insert"
  on public.notification_settings for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "notification settings owner update"
  on public.notification_settings for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create table if not exists public.reminder_category_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  profile_id uuid,
  category text not null,
  enabled boolean not null default true,
  notification_enabled boolean not null default false,
  default_lead_time_minutes integer,
  detail_level text not null default 'private' check (detail_level in ('private', 'category', 'detailed')),
  quiet_hours_behavior text not null default 'delay' check (quiet_hours_behavior in ('deliver', 'silent', 'delay')),
  quick_actions_enabled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists reminder_category_settings_unique_idx
  on public.reminder_category_settings (user_id, coalesce(profile_id, '00000000-0000-0000-0000-000000000000'::uuid), category);

create index if not exists reminder_category_settings_profile_idx
  on public.reminder_category_settings (user_id, profile_id);

alter table public.reminder_category_settings enable row level security;

create policy "reminder category settings owner select"
  on public.reminder_category_settings for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "reminder category settings owner insert"
  on public.reminder_category_settings for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "reminder category settings owner update"
  on public.reminder_category_settings for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create table if not exists public.scheduled_notification_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  profile_id uuid,
  reminder_id uuid,
  notification_id text,
  category text not null,
  scheduled_for timestamptz not null,
  title text not null,
  body text not null,
  detail_level text not null check (detail_level in ('private', 'category', 'detailed')),
  route text,
  params_json jsonb not null default '{}'::jsonb,
  status text not null default 'scheduled' check (status in ('scheduled', 'delivered', 'cancelled', 'failed', 'expired')),
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists scheduled_notification_records_user_status_idx
  on public.scheduled_notification_records (user_id, status, scheduled_for);

create index if not exists scheduled_notification_records_reminder_idx
  on public.scheduled_notification_records (reminder_id);

alter table public.scheduled_notification_records enable row level security;

create policy "scheduled notification records owner select"
  on public.scheduled_notification_records for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "scheduled notification records owner insert"
  on public.scheduled_notification_records for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "scheduled notification records owner update"
  on public.scheduled_notification_records for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create table if not exists public.reminder_action_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  profile_id uuid,
  reminder_id uuid,
  action text not null check (
    action in ('completed', 'taken', 'skipped', 'snoozed', 'opened', 'dismissed', 'rescheduled')
  ),
  action_source text not null check (action_source in ('in_app', 'notification', 'assistant', 'caregiver')),
  created_at timestamptz not null default now()
);

create index if not exists reminder_action_logs_user_idx
  on public.reminder_action_logs (user_id, created_at desc);

create index if not exists reminder_action_logs_reminder_idx
  on public.reminder_action_logs (reminder_id, created_at desc);

alter table public.reminder_action_logs enable row level security;

create policy "reminder action logs owner select"
  on public.reminder_action_logs for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "reminder action logs owner insert"
  on public.reminder_action_logs for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

-- Future extension columns for public.health_reminders, if that table exists:
-- alter table public.health_reminders add column if not exists category text;
-- alter table public.health_reminders add column if not exists detail_level text default 'private';
-- alter table public.health_reminders add column if not exists quiet_hours_behavior text default 'delay';
-- alter table public.health_reminders add column if not exists lead_time_minutes integer;
-- alter table public.health_reminders add column if not exists notification_enabled boolean default false;
-- alter table public.health_reminders add column if not exists notification_record_id uuid references public.scheduled_notification_records(id) on delete set null;
-- alter table public.health_reminders add column if not exists missed_threshold_minutes integer;
-- alter table public.health_reminders add column if not exists paused_until timestamptz;
-- alter table public.health_reminders add column if not exists source_realm text;
-- alter table public.health_reminders add column if not exists source_id text;
-- alter table public.health_reminders add column if not exists route text;
-- alter table public.health_reminders add column if not exists params_json jsonb not null default '{}'::jsonb;

-- Optional grants for projects where new public tables are not exposed
-- automatically to the Data API. Review before applying in production.
-- grant usage on schema public to authenticated;
-- grant select, insert, update on public.notification_settings to authenticated;
-- grant select, insert, update on public.reminder_category_settings to authenticated;
-- grant select, insert, update on public.scheduled_notification_records to authenticated;
-- grant select, insert on public.reminder_action_logs to authenticated;
