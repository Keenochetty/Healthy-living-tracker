create extension if not exists pgcrypto;

do $$ begin
  create type public.privacy_level as enum ('private', 'family_shared', 'partner_shared', 'caregiver_shared');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.notification_urgency as enum ('normal', 'schedule', 'attention', 'important', 'emergency');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.caregiver_access_status as enum ('pending', 'active', 'paused', 'revoked');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.care_activity_type as enum ('feed', 'nap', 'medication_given', 'bathroom', 'mood', 'activity', 'incident', 'photo_update', 'note_to_parent', 'emergency_alert');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.calendar_event_type as enum ('family_event', 'doctor_visit', 'medication_reminder', 'school_event', 'sports_day', 'caregiver_schedule', 'feeding_schedule', 'baby_routine', 'parent_appointment', 'child_submitted');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.event_response_status as enum ('pending', 'approved', 'declined', 'postponed');
exception when duplicate_object then null;
end $$;

alter table public.profiles
  add column if not exists app_role text not null default 'parent_guardian'
    check (app_role in ('parent_guardian', 'caregiver', 'woman', 'man', 'child')),
  add column if not exists active_profile_mode text not null default 'personal'
    check (active_profile_mode in ('personal', 'work'));

alter table public.family_members
  add column if not exists photo_url text,
  add column if not exists privacy_level public.privacy_level not null default 'family_shared',
  add column if not exists managed_by_user_id uuid references auth.users(id) on delete set null,
  add column if not exists partner_user_id uuid references auth.users(id) on delete set null,
  add column if not exists medication_notes text,
  add column if not exists feeding_instructions text;

alter table public.health_logs add column if not exists privacy_level public.privacy_level not null default 'family_shared';
alter table public.medicine_logs add column if not exists privacy_level public.privacy_level not null default 'family_shared';
alter table public.temperature_logs add column if not exists privacy_level public.privacy_level not null default 'family_shared';
alter table public.doctor_visits add column if not exists privacy_level public.privacy_level not null default 'family_shared';
alter table public.documents add column if not exists privacy_level public.privacy_level not null default 'family_shared';
alter table public.reminders add column if not exists privacy_level public.privacy_level not null default 'family_shared';

create table if not exists public.children (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  family_member_id uuid not null references public.family_members(id) on delete cascade unique,
  school_name text,
  grade_level text,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.children add column if not exists family_member_id uuid references public.family_members(id) on delete cascade;

create table if not exists public.caregiver_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade unique,
  display_name text,
  phone text,
  credentials text,
  emergency_training text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- Existing linked projects may have profile_id-based caregiver profiles.
alter table public.caregiver_profiles add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.caregiver_profiles add column if not exists display_name text;
alter table public.caregiver_profiles add column if not exists phone text;
alter table public.caregiver_profiles add column if not exists credentials text;
alter table public.caregiver_profiles add column if not exists active boolean default true;
alter table public.caregiver_profiles add column if not exists updated_at timestamptz default timezone('utc', now());

create table if not exists public.caregiver_child_access (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  child_id uuid not null references public.family_members(id) on delete cascade,
  caregiver_user_id uuid not null references auth.users(id) on delete cascade,
  granted_by_user_id uuid not null references auth.users(id) on delete cascade,
  status public.caregiver_access_status not null default 'pending',
  can_view_schedule boolean not null default true,
  can_view_allergies boolean not null default true,
  can_view_conditions boolean not null default true,
  can_view_medications boolean not null default true,
  can_upload_photos boolean not null default true,
  can_trigger_emergency boolean not null default true,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (child_id, caregiver_user_id)
);

-- Existing linked projects may have the newer caregiver_profile_id/is_active shape.
-- Add legacy columns used by this migration before indexes, helpers, and policies.
alter table public.caregiver_child_access add column if not exists caregiver_user_id uuid references auth.users(id) on delete cascade;
alter table public.caregiver_child_access add column if not exists granted_by_user_id uuid references auth.users(id) on delete cascade;
alter table public.caregiver_child_access add column if not exists status public.caregiver_access_status default 'pending';
alter table public.caregiver_child_access add column if not exists starts_at timestamptz;
alter table public.caregiver_child_access add column if not exists ends_at timestamptz;
alter table public.caregiver_child_access add column if not exists can_view_schedule boolean default true;
alter table public.caregiver_child_access add column if not exists can_view_allergies boolean default true;
alter table public.caregiver_child_access add column if not exists can_view_conditions boolean default true;
alter table public.caregiver_child_access add column if not exists can_view_medications boolean default true;
alter table public.caregiver_child_access add column if not exists can_log_activity boolean default true;
alter table public.caregiver_child_access add column if not exists can_upload_photos boolean default true;
alter table public.caregiver_child_access add column if not exists emergency_access boolean default true;
alter table public.caregiver_child_access add column if not exists updated_at timestamptz default timezone('utc', now());

create table if not exists public.sharing_permissions (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  family_member_id uuid references public.family_members(id) on delete cascade,
  subject_table text not null,
  subject_id uuid,
  privacy_level public.privacy_level not null,
  grantee_user_id uuid references auth.users(id) on delete cascade,
  grantee_family_role public.family_role,
  created_by_user_id uuid not null references auth.users(id) on delete cascade,
  expires_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  check (grantee_user_id is not null or grantee_family_role is not null)
);

-- Existing linked projects may have a newer owner/target sharing shape.
-- Add legacy columns used by this migration before indexes and policies.
alter table public.sharing_permissions add column if not exists family_id uuid references public.families(id) on delete cascade;
alter table public.sharing_permissions add column if not exists family_member_id uuid references public.family_members(id) on delete cascade;
alter table public.sharing_permissions add column if not exists subject_table text;
alter table public.sharing_permissions add column if not exists subject_id uuid;
alter table public.sharing_permissions add column if not exists grantee_user_id uuid references auth.users(id) on delete cascade;
alter table public.sharing_permissions add column if not exists grantee_family_role public.family_role;
alter table public.sharing_permissions add column if not exists created_by_user_id uuid references auth.users(id) on delete cascade;
alter table public.sharing_permissions add column if not exists expires_at timestamptz;
alter table public.sharing_permissions add column if not exists updated_at timestamptz default timezone('utc', now());

create table if not exists public.care_instructions (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  child_id uuid not null references public.family_members(id) on delete cascade,
  created_by_user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  instructions text not null,
  category text not null default 'general',
  privacy_level public.privacy_level not null default 'caregiver_shared',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  child_id uuid not null references public.family_members(id) on delete cascade,
  created_by_user_id uuid not null references auth.users(id) on delete cascade,
  actor_profile_mode text not null default 'personal' check (actor_profile_mode in ('personal', 'work')),
  activity_type public.care_activity_type not null,
  urgency public.notification_urgency not null default 'normal',
  privacy_level public.privacy_level not null default 'family_shared',
  title text not null,
  notes text,
  share_with_parents boolean not null default true,
  logged_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- Compatibility columns for linked projects that already have the newer activity log shape.
alter table public.activity_logs add column if not exists created_by_user_id uuid references auth.users(id) on delete cascade;
alter table public.activity_logs add column if not exists actor_profile_mode text default 'personal';
alter table public.activity_logs add column if not exists urgency public.notification_urgency default 'normal';
alter table public.activity_logs add column if not exists notes text;
alter table public.activity_logs add column if not exists share_with_parents boolean default true;
alter table public.activity_logs add column if not exists logged_at timestamptz default timezone('utc', now());
alter table public.activity_logs add column if not exists updated_at timestamptz default timezone('utc', now());

create table if not exists public.activity_photos (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  activity_log_id uuid not null references public.activity_logs(id) on delete cascade,
  uploaded_by_user_id uuid not null references auth.users(id) on delete cascade,
  storage_bucket text not null default 'activity-photos',
  storage_path text not null unique,
  caption text,
  created_at timestamptz not null default timezone('utc', now())
);

-- Compatibility columns for linked projects that already have the newer activity photo shape.
alter table public.activity_photos add column if not exists family_id uuid references public.families(id) on delete cascade;
alter table public.activity_photos add column if not exists uploaded_by_user_id uuid references auth.users(id) on delete cascade;
alter table public.activity_photos add column if not exists storage_bucket text default 'activity-photos';
alter table public.activity_photos add column if not exists caption text;

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  recipient_user_id uuid not null references auth.users(id) on delete cascade,
  actor_user_id uuid references auth.users(id) on delete set null,
  child_id uuid references public.family_members(id) on delete cascade,
  activity_log_id uuid references public.activity_logs(id) on delete cascade,
  urgency public.notification_urgency not null default 'normal',
  title text not null,
  message text not null,
  read_at timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);

-- Compatibility columns for linked projects that already have the newer notification shape.
alter table public.notifications add column if not exists recipient_user_id uuid references auth.users(id) on delete cascade;
alter table public.notifications add column if not exists actor_user_id uuid references auth.users(id) on delete set null;
alter table public.notifications add column if not exists activity_log_id uuid references public.activity_logs(id) on delete cascade;
alter table public.notifications add column if not exists urgency public.notification_urgency default 'normal';
alter table public.notifications add column if not exists message text;
alter table public.notifications add column if not exists read_at timestamptz;

create table if not exists public.calendar_events (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  family_member_id uuid references public.family_members(id) on delete cascade,
  child_id uuid references public.family_members(id) on delete cascade,
  created_by_user_id uuid not null references auth.users(id) on delete cascade,
  event_type public.calendar_event_type not null,
  title text not null,
  notes text,
  starts_at timestamptz not null,
  ends_at timestamptz,
  status public.event_response_status not null default 'pending',
  privacy_level public.privacy_level not null default 'family_shared',
  share_with_family boolean not null default true,
  share_with_caregiver boolean not null default false,
  google_calendar_event_id text,
  apple_calendar_event_id text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- Compatibility columns for linked projects that already have the newer calendar shape.
alter table public.calendar_events add column if not exists family_member_id uuid references public.family_members(id) on delete cascade;
alter table public.calendar_events add column if not exists created_by_user_id uuid references auth.users(id) on delete cascade;
alter table public.calendar_events add column if not exists event_type public.calendar_event_type;
alter table public.calendar_events add column if not exists notes text;
alter table public.calendar_events add column if not exists starts_at timestamptz;
alter table public.calendar_events add column if not exists ends_at timestamptz;
alter table public.calendar_events add column if not exists status public.event_response_status default 'pending';
alter table public.calendar_events add column if not exists share_with_family boolean default true;
alter table public.calendar_events add column if not exists share_with_caregiver boolean default false;
alter table public.calendar_events add column if not exists google_calendar_event_id text;
alter table public.calendar_events add column if not exists apple_calendar_event_id text;

create table if not exists public.event_responses (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.calendar_events(id) on delete cascade,
  family_id uuid not null references public.families(id) on delete cascade,
  responder_user_id uuid not null references auth.users(id) on delete cascade,
  response public.event_response_status not null,
  note text,
  proposed_start_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (event_id, responder_user_id)
);

-- Compatibility columns for linked projects that already have the newer event response shape.
alter table public.event_responses add column if not exists family_id uuid references public.families(id) on delete cascade;
alter table public.event_responses add column if not exists responder_user_id uuid references auth.users(id) on delete cascade;
alter table public.event_responses add column if not exists proposed_start_at timestamptz;

create table if not exists public.emergency_contacts (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  family_member_id uuid references public.family_members(id) on delete cascade,
  name text not null,
  relationship text,
  phone text not null,
  email text,
  priority integer not null default 1,
  share_with_caregiver boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.medications (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  family_member_id uuid not null references public.family_members(id) on delete cascade,
  name text not null,
  dosage text,
  schedule_notes text,
  active boolean not null default true,
  privacy_level public.privacy_level not null default 'family_shared',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.conditions (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  family_member_id uuid not null references public.family_members(id) on delete cascade,
  name text not null,
  notes text,
  active boolean not null default true,
  privacy_level public.privacy_level not null default 'family_shared',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  family_member_id uuid references public.family_members(id) on delete cascade,
  created_by_user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  provider_name text,
  appointment_at timestamptz not null,
  notes text,
  privacy_level public.privacy_level not null default 'family_shared',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  family_id uuid references public.families(id) on delete cascade,
  actor_user_id uuid references auth.users(id) on delete set null,
  action text not null,
  subject_table text,
  subject_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

-- Compatibility columns for linked projects that already have the newer audit log shape.
alter table public.audit_logs add column if not exists actor_user_id uuid references auth.users(id) on delete set null;
alter table public.audit_logs add column if not exists subject_table text;
alter table public.audit_logs add column if not exists subject_id uuid;

create index if not exists caregiver_child_access_child_idx on public.caregiver_child_access(child_id, caregiver_user_id, status);
create index if not exists caregiver_child_access_family_idx on public.caregiver_child_access(family_id, status);
create index if not exists sharing_permissions_subject_idx on public.sharing_permissions(subject_table, subject_id, privacy_level);
create index if not exists care_instructions_child_idx on public.care_instructions(child_id, category);
create index if not exists activity_logs_child_logged_idx on public.activity_logs(child_id, logged_at desc);
create index if not exists notifications_recipient_idx on public.notifications(recipient_user_id, read_at, created_at desc);
create index if not exists calendar_events_family_start_idx on public.calendar_events(family_id, starts_at);
create index if not exists emergency_contacts_family_member_idx on public.emergency_contacts(family_id, family_member_id);
create index if not exists medications_member_active_idx on public.medications(family_member_id, active);
create index if not exists conditions_member_active_idx on public.conditions(family_member_id, active);
create index if not exists appointments_family_at_idx on public.appointments(family_id, appointment_at);

create or replace function private.user_has_child_caregiver_access(target_child_id uuid)
returns boolean
language sql
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.caregiver_child_access cca
    where cca.child_id = target_child_id
      and cca.caregiver_user_id = (select auth.uid())
      and cca.status = 'active'
      and (cca.starts_at is null or cca.starts_at <= timezone('utc', now()))
      and (cca.ends_at is null or cca.ends_at >= timezone('utc', now()))
  );
$$;

revoke execute on function private.user_has_child_caregiver_access(uuid) from public, anon, authenticated, service_role;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'children',
    'caregiver_profiles',
    'caregiver_child_access',
    'sharing_permissions',
    'care_instructions',
    'activity_logs',
    'activity_photos',
    'notifications',
    'calendar_events',
    'event_responses',
    'emergency_contacts',
    'medications',
    'conditions',
    'appointments',
    'audit_logs'
  ] loop
    execute format('alter table public.%I enable row level security', table_name);
  end loop;
end $$;

grant select, insert, update, delete on
  public.children,
  public.caregiver_profiles,
  public.caregiver_child_access,
  public.sharing_permissions,
  public.care_instructions,
  public.activity_logs,
  public.activity_photos,
  public.notifications,
  public.calendar_events,
  public.event_responses,
  public.emergency_contacts,
  public.medications,
  public.conditions,
  public.appointments,
  public.audit_logs
to authenticated;

drop policy if exists "Family users can manage children" on public.children;
create policy "Family users can manage children" on public.children for all
to authenticated using ((select private.user_has_family_access(family_id)))
with check ((select private.user_has_family_access(family_id)));

drop policy if exists "Caregivers can read assigned children" on public.children;
create policy "Caregivers can read assigned children" on public.children for select
to authenticated using ((select private.user_has_child_caregiver_access(family_member_id)));

drop policy if exists "Users can manage own caregiver profile" on public.caregiver_profiles;
create policy "Users can manage own caregiver profile" on public.caregiver_profiles for all
to authenticated using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

drop policy if exists "Family admins can manage caregiver access" on public.caregiver_child_access;
create policy "Family admins can manage caregiver access" on public.caregiver_child_access for all
to authenticated using ((select private.user_can_admin_family(family_id)))
with check ((select private.user_can_admin_family(family_id)) and granted_by_user_id = (select auth.uid()));

drop policy if exists "Caregivers can read own access grants" on public.caregiver_child_access;
create policy "Caregivers can read own access grants" on public.caregiver_child_access for select
to authenticated using (caregiver_user_id = (select auth.uid()));

drop policy if exists "Family users can manage sharing permissions" on public.sharing_permissions;
create policy "Family users can manage sharing permissions" on public.sharing_permissions for all
to authenticated using ((select private.user_has_family_access(family_id)))
with check ((select private.user_has_family_access(family_id)) and created_by_user_id = (select auth.uid()));

drop policy if exists "Grantees can read sharing permissions" on public.sharing_permissions;
create policy "Grantees can read sharing permissions" on public.sharing_permissions for select
to authenticated using (grantee_user_id = (select auth.uid()) or (select private.user_has_family_access(family_id)));

drop policy if exists "Family users can manage care instructions" on public.care_instructions;
create policy "Family users can manage care instructions" on public.care_instructions for all
to authenticated using ((select private.user_has_family_access(family_id)))
with check ((select private.user_has_family_access(family_id)) and created_by_user_id = (select auth.uid()));

drop policy if exists "Caregivers can read shared care instructions" on public.care_instructions;
create policy "Caregivers can read shared care instructions" on public.care_instructions for select
to authenticated using (privacy_level = 'caregiver_shared' and (select private.user_has_child_caregiver_access(child_id)));

drop policy if exists "Family users can manage activity logs" on public.activity_logs;
create policy "Family users can manage activity logs" on public.activity_logs for all
to authenticated using ((select private.user_has_family_access(family_id)))
with check (
  (select private.user_has_family_access(family_id))
  and created_by_user_id = (select auth.uid())
  and exists (
    select 1
    from public.family_members fm
    where fm.id = activity_logs.child_id
      and fm.family_id = activity_logs.family_id
  )
);

drop policy if exists "Caregivers can create assigned child activity logs" on public.activity_logs;
create policy "Caregivers can create assigned child activity logs" on public.activity_logs for insert
to authenticated with check (
  created_by_user_id = (select auth.uid())
  and actor_profile_mode = 'work'
  and privacy_level = 'caregiver_shared'
  and (select private.user_has_child_caregiver_access(child_id))
  and exists (
    select 1
    from public.family_members fm
    where fm.id = activity_logs.child_id
      and fm.family_id = activity_logs.family_id
  )
);

drop policy if exists "Caregivers can read assigned child shared activity logs" on public.activity_logs;
create policy "Caregivers can read assigned child shared activity logs" on public.activity_logs for select
to authenticated using (privacy_level = 'caregiver_shared' and (select private.user_has_child_caregiver_access(child_id)));

drop policy if exists "Family users can manage activity photos" on public.activity_photos;
create policy "Family users can manage activity photos" on public.activity_photos for all
to authenticated using ((select private.user_has_family_access(family_id)))
with check ((select private.user_has_family_access(family_id)) and uploaded_by_user_id = (select auth.uid()));

drop policy if exists "Caregivers can read assigned child activity photos" on public.activity_photos;
create policy "Caregivers can read assigned child activity photos" on public.activity_photos for select
to authenticated using (
  exists (
    select 1
    from public.activity_logs al
    where al.id = activity_photos.activity_log_id
      and al.privacy_level = 'caregiver_shared'
      and (select private.user_has_child_caregiver_access(al.child_id))
  )
);

drop policy if exists "Users can read own notifications" on public.notifications;
create policy "Users can read own notifications" on public.notifications for select
to authenticated using (recipient_user_id = (select auth.uid()));

drop policy if exists "Users can update own notifications" on public.notifications;
create policy "Users can update own notifications" on public.notifications for update
to authenticated using (recipient_user_id = (select auth.uid()))
with check (recipient_user_id = (select auth.uid()));

drop policy if exists "Family users can create notifications" on public.notifications;
create policy "Family users can create notifications" on public.notifications for insert
to authenticated with check (
  (select private.user_has_family_access(family_id))
  or (
    actor_user_id = (select auth.uid())
    and child_id is not null
    and (select private.user_has_child_caregiver_access(child_id))
    and exists (
      select 1
      from public.family_members fm
      where fm.id = notifications.child_id
        and fm.family_id = notifications.family_id
    )
  )
);

drop policy if exists "Family users can manage calendar events" on public.calendar_events;
create policy "Family users can manage calendar events" on public.calendar_events for all
to authenticated using ((select private.user_has_family_access(family_id)))
with check ((select private.user_has_family_access(family_id)) and created_by_user_id = (select auth.uid()));

drop policy if exists "Caregivers can read shared child calendar events" on public.calendar_events;
create policy "Caregivers can read shared child calendar events" on public.calendar_events for select
to authenticated using (share_with_caregiver and child_id is not null and (select private.user_has_child_caregiver_access(child_id)));

drop policy if exists "Family users can manage event responses" on public.event_responses;
create policy "Family users can manage event responses" on public.event_responses for all
to authenticated using ((select private.user_has_family_access(family_id)) or responder_user_id = (select auth.uid()))
with check (responder_user_id = (select auth.uid()));

drop policy if exists "Family users can manage emergency contacts" on public.emergency_contacts;
create policy "Family users can manage emergency contacts" on public.emergency_contacts for all
to authenticated using ((select private.user_has_family_access(family_id)))
with check ((select private.user_has_family_access(family_id)));

drop policy if exists "Caregivers can read shared emergency contacts" on public.emergency_contacts;
create policy "Caregivers can read shared emergency contacts" on public.emergency_contacts for select
to authenticated using (share_with_caregiver and family_member_id is not null and (select private.user_has_child_caregiver_access(family_member_id)));

drop policy if exists "Family users can manage medications" on public.medications;
create policy "Family users can manage medications" on public.medications for all
to authenticated using ((select private.user_has_family_access(family_id)))
with check ((select private.user_has_family_access(family_id)));

drop policy if exists "Caregivers can read shared medications" on public.medications;
create policy "Caregivers can read shared medications" on public.medications for select
to authenticated using (privacy_level = 'caregiver_shared' and (select private.user_has_child_caregiver_access(family_member_id)));

drop policy if exists "Family users can manage conditions" on public.conditions;
create policy "Family users can manage conditions" on public.conditions for all
to authenticated using ((select private.user_has_family_access(family_id)))
with check ((select private.user_has_family_access(family_id)));

drop policy if exists "Caregivers can read shared conditions" on public.conditions;
create policy "Caregivers can read shared conditions" on public.conditions for select
to authenticated using (privacy_level = 'caregiver_shared' and (select private.user_has_child_caregiver_access(family_member_id)));

drop policy if exists "Family users can manage appointments" on public.appointments;
create policy "Family users can manage appointments" on public.appointments for all
to authenticated using ((select private.user_has_family_access(family_id)))
with check ((select private.user_has_family_access(family_id)) and created_by_user_id = (select auth.uid()));

drop policy if exists "Family users can read audit logs" on public.audit_logs;
create policy "Family users can read audit logs" on public.audit_logs for select
to authenticated using (family_id is not null and (select private.user_has_family_access(family_id)));

drop policy if exists "Users can create audit logs" on public.audit_logs;
create policy "Users can create audit logs" on public.audit_logs for insert
to authenticated with check (actor_user_id = (select auth.uid()));

insert into storage.buckets (id, name, public)
values ('activity-photos', 'activity-photos', false)
on conflict (id) do update set public = false;

drop policy if exists "Family users can read activity photos" on storage.objects;
create policy "Family users can read activity photos" on storage.objects for select
to authenticated
using (
  bucket_id = 'activity-photos'
  and (select private.user_has_family_access(((storage.foldername(name))[1])::uuid))
);

drop policy if exists "Family users can upload activity photos" on storage.objects;
create policy "Family users can upload activity photos" on storage.objects for insert
to authenticated
with check (
  bucket_id = 'activity-photos'
  and (select private.user_has_family_access(((storage.foldername(name))[1])::uuid))
);

do $$
declare
  target_table text;
begin
  foreach target_table in array array[
    'children',
    'caregiver_profiles',
    'caregiver_child_access',
    'sharing_permissions',
    'care_instructions',
    'activity_logs',
    'calendar_events',
    'event_responses',
    'emergency_contacts',
    'medications',
    'conditions',
    'appointments'
  ] loop
    execute format('drop trigger if exists %I_set_updated_at on public.%I', target_table, target_table);
    execute format('create trigger %I_set_updated_at before update on public.%I for each row execute function public.set_updated_at()', target_table, target_table);
  end loop;
end $$;
