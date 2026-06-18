-- HealthOS Backend Batch 5: Calendar + Reminders Foundation
-- Additive draft only. Do not apply remotely until reviewed with the full migration chain.

do $$
begin
  if exists (select 1 from pg_type where typname = 'reminder_status' and typnamespace = 'public'::regnamespace) then
    alter type public.reminder_status add value if not exists 'draft';
    alter type public.reminder_status add value if not exists 'needs_review';
    alter type public.reminder_status add value if not exists 'scheduled';
    alter type public.reminder_status add value if not exists 'local_scheduled';
    alter type public.reminder_status add value if not exists 'push_pending';
    alter type public.reminder_status add value if not exists 'due';
    alter type public.reminder_status add value if not exists 'missed';
    alter type public.reminder_status add value if not exists 'snoozed';
    alter type public.reminder_status add value if not exists 'skipped';
    alter type public.reminder_status add value if not exists 'failed';
    alter type public.reminder_status add value if not exists 'deferred';
    alter type public.reminder_status add value if not exists 'unknown';
  end if;
end $$;

create table if not exists public.calendar_events (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid references auth.users(id) on delete cascade,
  subject_care_profile_id uuid references public.care_profiles(id) on delete set null,
  title text not null,
  description text,
  event_type text not null default 'general',
  privacy_scope text not null default 'private',
  start_at timestamptz,
  end_at timestamptz,
  all_day boolean not null default false,
  timezone text,
  location text,
  source_type text not null default 'manual',
  review_status text not null default 'saved',
  created_from_ai_import_id uuid,
  created_from_record_id uuid references public.records(id) on delete set null,
  family_circle_id uuid references public.family_circles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  cancelled_at timestamptz
);

alter table public.calendar_events
  add column if not exists owner_user_id uuid references auth.users(id) on delete cascade,
  add column if not exists subject_care_profile_id uuid references public.care_profiles(id) on delete set null,
  add column if not exists privacy_scope text default 'private',
  add column if not exists start_at timestamptz,
  add column if not exists end_at timestamptz,
  add column if not exists all_day boolean default false,
  add column if not exists timezone text,
  add column if not exists source_type text default 'manual',
  add column if not exists review_status text default 'saved',
  add column if not exists created_from_ai_import_id uuid,
  add column if not exists created_from_record_id uuid references public.records(id) on delete set null,
  add column if not exists family_circle_id uuid references public.family_circles(id) on delete set null,
  add column if not exists cancelled_at timestamptz;

comment on table public.calendar_events is
  'HealthOS calendar event metadata. A calendar event is not a scheduled notification.';
comment on column public.calendar_events.privacy_scope is
  'Private by default. Shared visibility requires explicit permission outside this Batch 5 draft.';
comment on column public.calendar_events.review_status is
  'AI and scan-created calendar candidates must remain draft/needs_review until user review.';

create table if not exists public.calendar_event_links (
  id uuid primary key default gen_random_uuid(),
  calendar_event_id uuid not null references public.calendar_events(id) on delete cascade,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  linked_realm text not null,
  linked_table text,
  linked_row_id uuid,
  link_status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.calendar_event_links is
  'Links calendar events to source realm rows. A link never grants access to the linked row.';

create table if not exists public.reminders (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid references auth.users(id) on delete cascade,
  subject_care_profile_id uuid references public.care_profiles(id) on delete set null,
  calendar_event_id uuid references public.calendar_events(id) on delete set null,
  title_privacy_safe text,
  details_private text,
  category text not null default 'general',
  source_realm text not null default 'general',
  source_table text,
  source_row_id uuid,
  source_record_id uuid references public.records(id) on delete set null,
  ai_import_id uuid,
  privacy_scope text not null default 'private',
  status text not null default 'draft',
  urgency text not null default 'normal',
  scheduled_for timestamptz,
  timezone text,
  repeat_rule text,
  quiet_hours_respect boolean not null default true,
  local_notification_id text,
  push_notification_status text not null default 'not_configured',
  review_required boolean not null default true,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  cancelled_at timestamptz
);

alter table public.reminders
  add column if not exists owner_user_id uuid references auth.users(id) on delete cascade,
  add column if not exists subject_care_profile_id uuid references public.care_profiles(id) on delete set null,
  add column if not exists calendar_event_id uuid references public.calendar_events(id) on delete set null,
  add column if not exists title_privacy_safe text,
  add column if not exists details_private text,
  add column if not exists category text default 'general',
  add column if not exists source_realm text default 'general',
  add column if not exists source_table text,
  add column if not exists source_row_id uuid,
  add column if not exists source_record_id uuid references public.records(id) on delete set null,
  add column if not exists ai_import_id uuid,
  add column if not exists privacy_scope text default 'private',
  add column if not exists urgency text default 'normal',
  add column if not exists scheduled_for timestamptz,
  add column if not exists timezone text,
  add column if not exists repeat_rule text,
  add column if not exists quiet_hours_respect boolean default true,
  add column if not exists local_notification_id text,
  add column if not exists push_notification_status text default 'not_configured',
  add column if not exists review_required boolean default true,
  add column if not exists reviewed_at timestamptz,
  add column if not exists cancelled_at timestamptz;

comment on table public.reminders is
  'HealthOS reminder metadata and scheduling intent. A reminder record is not an OS notification.';
comment on column public.reminders.title_privacy_safe is
  'Lock-screen safe title. Sensitive details belong in details_private.';
comment on column public.reminders.review_required is
  'Medication, pregnancy, baby/child, women health, records, family/caregiver, health symptom, and AI reminders require review before scheduling.';
comment on column public.reminders.local_notification_id is
  'Set only after user-confirmed local notification scheduling.';
comment on column public.reminders.push_notification_status is
  'Push backend is deferred in Batch 5.';

create table if not exists public.reminder_history (
  id uuid primary key default gen_random_uuid(),
  reminder_id uuid not null references public.reminders(id) on delete cascade,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  event_type text not null,
  event_note text,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

comment on table public.reminder_history is
  'Reminder lifecycle history. Do not log sensitive medication, records, or women health details in event_note.';

create table if not exists public.notification_events (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  reminder_id uuid references public.reminders(id) on delete set null,
  notification_type text not null default 'in_app',
  title_privacy_safe text not null,
  body_privacy_safe text,
  status text not null default 'created',
  created_at timestamptz not null default now(),
  read_at timestamptz,
  dismissed_at timestamptz
);

comment on table public.notification_events is
  'App-side privacy-safe notification events. This is not push delivery infrastructure.';

alter table public.calendar_events enable row level security;
alter table public.calendar_event_links enable row level security;
alter table public.reminders enable row level security;
alter table public.reminder_history enable row level security;
alter table public.notification_events enable row level security;

create index if not exists calendar_events_owner_user_id_idx on public.calendar_events(owner_user_id);
create index if not exists calendar_events_subject_care_profile_id_idx on public.calendar_events(subject_care_profile_id);
create index if not exists calendar_events_start_at_idx on public.calendar_events(start_at);
create index if not exists calendar_events_review_status_idx on public.calendar_events(review_status);
create index if not exists calendar_events_source_type_idx on public.calendar_events(source_type);

create index if not exists calendar_event_links_event_idx on public.calendar_event_links(calendar_event_id);
create index if not exists calendar_event_links_owner_idx on public.calendar_event_links(owner_user_id);
create index if not exists calendar_event_links_realm_idx on public.calendar_event_links(linked_realm);

create index if not exists reminders_owner_user_id_idx on public.reminders(owner_user_id);
create index if not exists reminders_subject_care_profile_id_idx on public.reminders(subject_care_profile_id);
create index if not exists reminders_calendar_event_id_idx on public.reminders(calendar_event_id);
create index if not exists reminders_scheduled_for_idx on public.reminders(scheduled_for);
create index if not exists reminders_status_idx on public.reminders(status);
create index if not exists reminders_source_realm_idx on public.reminders(source_realm);

create index if not exists reminder_history_reminder_id_idx on public.reminder_history(reminder_id);
create index if not exists reminder_history_owner_user_id_idx on public.reminder_history(owner_user_id);
create index if not exists reminder_history_occurred_at_idx on public.reminder_history(occurred_at);

create index if not exists notification_events_owner_user_id_idx on public.notification_events(owner_user_id);
create index if not exists notification_events_reminder_id_idx on public.notification_events(reminder_id);
create index if not exists notification_events_status_idx on public.notification_events(status);

do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'calendar_events' and policyname = 'Owners can read own canonical calendar events') then
    create policy "Owners can read own canonical calendar events"
      on public.calendar_events for select
      to authenticated
      using ((select auth.uid()) = owner_user_id);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'calendar_events' and policyname = 'Owners can insert own canonical calendar events') then
    create policy "Owners can insert own canonical calendar events"
      on public.calendar_events for insert
      to authenticated
      with check ((select auth.uid()) = owner_user_id);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'calendar_events' and policyname = 'Owners can update own canonical calendar events') then
    create policy "Owners can update own canonical calendar events"
      on public.calendar_events for update
      to authenticated
      using ((select auth.uid()) = owner_user_id)
      with check ((select auth.uid()) = owner_user_id);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'calendar_events' and policyname = 'Owners can delete own canonical calendar events') then
    create policy "Owners can delete own canonical calendar events"
      on public.calendar_events for delete
      to authenticated
      using ((select auth.uid()) = owner_user_id);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'calendar_event_links' and policyname = 'Owners can read own calendar event links') then
    create policy "Owners can read own calendar event links"
      on public.calendar_event_links for select
      to authenticated
      using ((select auth.uid()) = owner_user_id);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'calendar_event_links' and policyname = 'Owners can insert own calendar event links') then
    create policy "Owners can insert own calendar event links"
      on public.calendar_event_links for insert
      to authenticated
      with check (
        (select auth.uid()) = owner_user_id
        and exists (
          select 1 from public.calendar_events ce
          where ce.id = calendar_event_id
            and ce.owner_user_id = (select auth.uid())
        )
      );
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'calendar_event_links' and policyname = 'Owners can update own calendar event links') then
    create policy "Owners can update own calendar event links"
      on public.calendar_event_links for update
      to authenticated
      using ((select auth.uid()) = owner_user_id)
      with check ((select auth.uid()) = owner_user_id);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'calendar_event_links' and policyname = 'Owners can delete own calendar event links') then
    create policy "Owners can delete own calendar event links"
      on public.calendar_event_links for delete
      to authenticated
      using ((select auth.uid()) = owner_user_id);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'reminders' and policyname = 'Owners can read own canonical reminders') then
    create policy "Owners can read own canonical reminders"
      on public.reminders for select
      to authenticated
      using ((select auth.uid()) = owner_user_id);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'reminders' and policyname = 'Owners can insert own canonical reminders') then
    create policy "Owners can insert own canonical reminders"
      on public.reminders for insert
      to authenticated
      with check ((select auth.uid()) = owner_user_id);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'reminders' and policyname = 'Owners can update own canonical reminders') then
    create policy "Owners can update own canonical reminders"
      on public.reminders for update
      to authenticated
      using ((select auth.uid()) = owner_user_id)
      with check ((select auth.uid()) = owner_user_id);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'reminders' and policyname = 'Owners can delete own canonical reminders') then
    create policy "Owners can delete own canonical reminders"
      on public.reminders for delete
      to authenticated
      using ((select auth.uid()) = owner_user_id);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'reminder_history' and policyname = 'Owners can read own reminder history') then
    create policy "Owners can read own reminder history"
      on public.reminder_history for select
      to authenticated
      using ((select auth.uid()) = owner_user_id);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'reminder_history' and policyname = 'Owners can insert own reminder history') then
    create policy "Owners can insert own reminder history"
      on public.reminder_history for insert
      to authenticated
      with check (
        (select auth.uid()) = owner_user_id
        and exists (
          select 1 from public.reminders r
          where r.id = reminder_id
            and r.owner_user_id = (select auth.uid())
        )
      );
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'notification_events' and policyname = 'Owners can read own notification events') then
    create policy "Owners can read own notification events"
      on public.notification_events for select
      to authenticated
      using ((select auth.uid()) = owner_user_id);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'notification_events' and policyname = 'Owners can insert own notification events') then
    create policy "Owners can insert own notification events"
      on public.notification_events for insert
      to authenticated
      with check ((select auth.uid()) = owner_user_id);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'notification_events' and policyname = 'Owners can update own notification events') then
    create policy "Owners can update own notification events"
      on public.notification_events for update
      to authenticated
      using ((select auth.uid()) = owner_user_id)
      with check ((select auth.uid()) = owner_user_id);
  end if;
end $$;
