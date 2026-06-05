-- Phase 13 Calendar, Reminders + Health Timeline schema draft
-- Documentation only. Do not apply this file as a migration in Phase 13.
-- Local app behavior calculates reminders and timeline data from AsyncStorage first.

create table if not exists public.health_reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  profile_id uuid,
  title text not null,
  type text not null,
  status text not null default 'upcoming',
  due_at timestamptz not null,
  all_day boolean not null default false,
  repeat_frequency text not null default 'none',
  repeat_rule text,
  snoozed_until timestamptz,
  source text not null default 'manual',
  source_type text,
  source_id text,
  linked_entity_type text,
  linked_entity_id text,
  notes text,
  notification_enabled boolean not null default false,
  notification_id text,
  notification_metadata jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  is_private boolean not null default true,
  locked_private boolean not null default true,
  shared_with_partner boolean not null default false,
  shared_with_family boolean not null default false,
  shared_with_caregiver boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists health_reminders_user_profile_due_idx
  on public.health_reminders (user_id, profile_id, due_at);

create index if not exists health_reminders_source_idx
  on public.health_reminders (user_id, source, source_id);

create index if not exists health_reminders_status_idx
  on public.health_reminders (user_id, status, due_at);

create table if not exists public.health_timeline_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  profile_id uuid,
  title text not null,
  type text not null,
  event_at timestamptz not null,
  source text not null,
  source_id text,
  linked_entity_type text,
  linked_entity_id text,
  description text,
  metadata jsonb not null default '{}'::jsonb,
  is_private boolean not null default true,
  locked_private boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists health_timeline_events_user_profile_event_idx
  on public.health_timeline_events (user_id, profile_id, event_at desc);

create index if not exists health_timeline_events_source_idx
  on public.health_timeline_events (user_id, source, source_id);

create table if not exists public.calendar_day_summaries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  profile_id uuid,
  summary_date date not null,
  reminder_count integer not null default 0,
  due_count integer not null default 0,
  completed_count integer not null default 0,
  missed_count integer not null default 0,
  event_count integer not null default 0,
  summary_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, profile_id, summary_date)
);

create index if not exists calendar_day_summaries_user_profile_date_idx
  on public.calendar_day_summaries (user_id, profile_id, summary_date);

alter table public.health_reminders enable row level security;
alter table public.health_timeline_events enable row level security;
alter table public.calendar_day_summaries enable row level security;

-- Policy examples for later migration use:
create policy "Users can manage their health reminders"
  on public.health_reminders
  for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can manage their health timeline events"
  on public.health_timeline_events
  for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can manage their calendar day summaries"
  on public.calendar_day_summaries
  for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- Depending on Supabase project settings, new public tables may need explicit
-- Data API grants before supabase-js or GraphQL clients can access them.
-- Example, adjust when applying:
-- grant select, insert, update, delete on public.health_reminders to authenticated;
-- grant select, insert, update, delete on public.health_timeline_events to authenticated;
-- grant select, insert, update, delete on public.calendar_day_summaries to authenticated;
