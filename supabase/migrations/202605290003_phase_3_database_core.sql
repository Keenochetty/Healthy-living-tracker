create extension if not exists pgcrypto;

do $$ begin
  create type public.ai_action_status as enum ('pending', 'running', 'completed', 'failed', 'cancelled');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.ai_action_type as enum (
    'summarize_health_records',
    'draft_care_plan',
    'extract_document_data',
    'risk_triage',
    'generate_reminders',
    'caregiver_handoff',
    'general_assistant_action'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.device_platform as enum ('ios', 'android', 'web');
exception when duplicate_object then null;
end $$;

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  phone text,
  display_name text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.health_records (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  family_member_id uuid not null references public.family_members(id) on delete cascade,
  created_by_user_id uuid not null references auth.users(id) on delete cascade,
  record_type public.tracking_category not null,
  title text not null,
  notes text,
  occurred_at timestamptz not null default timezone('utc', now()),
  privacy_level public.privacy_level not null default 'family_shared',
  source_table text,
  source_id uuid,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  check (source_table is null or source_table in (
    'health_logs',
    'medicine_logs',
    'temperature_logs',
    'doctor_visits',
    'medications',
    'conditions',
    'appointments',
    'documents'
  ))
);

create table if not exists public.ai_chat_sessions (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  family_member_id uuid references public.family_members(id) on delete set null,
  created_by_user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'New health chat',
  model text,
  status text not null default 'active' check (status in ('active', 'archived')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.ai_actions (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  family_member_id uuid references public.family_members(id) on delete set null,
  session_id uuid references public.ai_chat_sessions(id) on delete set null,
  requested_by_user_id uuid not null references auth.users(id) on delete cascade,
  action_type public.ai_action_type not null default 'general_assistant_action',
  status public.ai_action_status not null default 'pending',
  input jsonb not null default '{}'::jsonb,
  output jsonb,
  error_message text,
  privacy_level public.privacy_level not null default 'family_shared',
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  check (
    completed_at is null
    or started_at is null
    or completed_at >= started_at
  )
);

create table if not exists public.device_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  platform public.device_platform not null,
  token text not null unique,
  device_name text,
  last_seen_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  locale text not null default 'en',
  timezone text not null default 'UTC',
  notification_preferences jsonb not null default '{"push": true, "email": true, "sms": false}'::jsonb,
  privacy_defaults jsonb not null default '{"health_records": "family_shared", "ai_actions": "private"}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- Existing linked projects may already have newer profile_id-based settings/token/AI tables.
-- Add legacy columns used by this migration before indexes, policies, triggers, and backfills.
alter table public.device_tokens add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.device_tokens add column if not exists platform public.device_platform;
alter table public.device_tokens add column if not exists token text;
alter table public.device_tokens add column if not exists last_seen_at timestamptz;
alter table public.device_tokens add column if not exists updated_at timestamptz default timezone('utc', now());

alter table public.user_settings add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.user_settings add column if not exists locale text default 'en';
alter table public.user_settings add column if not exists timezone text default 'UTC';
alter table public.user_settings add column if not exists privacy_defaults jsonb default '{"health_records": "family_shared", "ai_actions": "private"}'::jsonb;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'user_settings_user_id_key'
      and conrelid = 'public.user_settings'::regclass
  ) then
    alter table public.user_settings add constraint user_settings_user_id_key unique (user_id);
  end if;
end $$;

alter table public.ai_chat_sessions add column if not exists created_by_user_id uuid references auth.users(id) on delete cascade;
alter table public.ai_chat_sessions add column if not exists family_member_id uuid references public.family_members(id) on delete set null;
alter table public.ai_chat_sessions add column if not exists model text;
alter table public.ai_chat_sessions add column if not exists status text default 'active';
alter table public.ai_chat_sessions add column if not exists metadata jsonb default '{}'::jsonb;
alter table public.ai_chat_sessions add column if not exists updated_at timestamptz default timezone('utc', now());

alter table public.ai_actions add column if not exists requested_by_user_id uuid references auth.users(id) on delete cascade;
alter table public.ai_actions add column if not exists family_id uuid references public.families(id) on delete cascade;
alter table public.ai_actions add column if not exists family_member_id uuid references public.family_members(id) on delete set null;
alter table public.ai_actions add column if not exists input jsonb default '{}'::jsonb;
alter table public.ai_actions add column if not exists output jsonb;
alter table public.ai_actions add column if not exists privacy_level public.privacy_level default 'private';
alter table public.ai_actions add column if not exists confirmed_at timestamptz;
alter table public.ai_actions add column if not exists completed_at timestamptz;
alter table public.ai_actions add column if not exists updated_at timestamptz default timezone('utc', now());

create index if not exists users_email_idx on public.users(lower(email));
create index if not exists users_phone_idx on public.users(phone);
create index if not exists health_records_family_member_occurred_idx on public.health_records(family_id, family_member_id, occurred_at desc);
create index if not exists health_records_created_by_user_id_idx on public.health_records(created_by_user_id);
create index if not exists health_records_source_idx on public.health_records(source_table, source_id);
create index if not exists ai_chat_sessions_family_updated_idx on public.ai_chat_sessions(family_id, updated_at desc);
create index if not exists ai_chat_sessions_created_by_user_id_idx on public.ai_chat_sessions(created_by_user_id);
create index if not exists ai_actions_family_status_idx on public.ai_actions(family_id, status, created_at desc);
create index if not exists ai_actions_requested_by_user_id_idx on public.ai_actions(requested_by_user_id);
create index if not exists ai_actions_session_id_idx on public.ai_actions(session_id);
create index if not exists device_tokens_user_id_idx on public.device_tokens(user_id);

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'users',
    'profiles',
    'families',
    'family_members',
    'children',
    'caregiver_profiles',
    'caregiver_child_access',
    'sharing_permissions',
    'health_records',
    'care_instructions',
    'activity_logs',
    'activity_photos',
    'calendar_events',
    'event_responses',
    'notifications',
    'emergency_contacts',
    'medications',
    'conditions',
    'appointments',
    'documents',
    'ai_chat_sessions',
    'ai_actions',
    'audit_logs',
    'device_tokens',
    'user_settings'
  ] loop
    if to_regclass(format('public.%I', table_name)) is not null then
      execute format('alter table public.%I enable row level security', table_name);
      execute format('alter table public.%I force row level security', table_name);
    end if;
  end loop;
end $$;

grant usage on schema public to authenticated;
grant select, insert, update, delete on
  public.users,
  public.health_records,
  public.ai_chat_sessions,
  public.ai_actions,
  public.device_tokens,
  public.user_settings
to authenticated;

drop policy if exists "Users can read own user row" on public.users;
create policy "Users can read own user row" on public.users for select
to authenticated using (id = (select auth.uid()));

drop policy if exists "Users can update own user row" on public.users;
create policy "Users can update own user row" on public.users for update
to authenticated using (id = (select auth.uid()))
with check (id = (select auth.uid()));

drop policy if exists "Users can read accessible health records" on public.health_records;
create policy "Users can read accessible health records" on public.health_records for select
to authenticated using (
  (select private.user_has_family_access(family_id))
  or (
    privacy_level = 'caregiver_shared'
    and (select private.user_has_child_caregiver_access(family_member_id))
  )
);

drop policy if exists "Users can create accessible health records" on public.health_records;
create policy "Users can create accessible health records" on public.health_records for insert
to authenticated with check (
  created_by_user_id = (select auth.uid())
  and exists (
    select 1
    from public.family_members fm
    where fm.id = health_records.family_member_id
      and fm.family_id = health_records.family_id
  )
  and (
    (select private.user_has_family_access(family_id))
    or (
      privacy_level = 'caregiver_shared'
      and (select private.user_has_child_caregiver_access(family_member_id))
    )
  )
);

drop policy if exists "Users can update own health records" on public.health_records;
create policy "Users can update own health records" on public.health_records for update
to authenticated using (
  created_by_user_id = (select auth.uid())
  and (select private.user_has_family_access(family_id))
)
with check (
  created_by_user_id = (select auth.uid())
  and (select private.user_has_family_access(family_id))
  and exists (
    select 1
    from public.family_members fm
    where fm.id = health_records.family_member_id
      and fm.family_id = health_records.family_id
  )
);

drop policy if exists "Users can delete own health records" on public.health_records;
create policy "Users can delete own health records" on public.health_records for delete
to authenticated using (
  created_by_user_id = (select auth.uid())
  and (select private.user_has_family_access(family_id))
);

drop policy if exists "Users can read accessible ai chat sessions" on public.ai_chat_sessions;
create policy "Users can read accessible ai chat sessions" on public.ai_chat_sessions for select
to authenticated using ((select private.user_has_family_access(family_id)));

drop policy if exists "Users can create accessible ai chat sessions" on public.ai_chat_sessions;
create policy "Users can create accessible ai chat sessions" on public.ai_chat_sessions for insert
to authenticated with check (
  created_by_user_id = (select auth.uid())
  and (select private.user_has_family_access(family_id))
);

drop policy if exists "Users can update own ai chat sessions" on public.ai_chat_sessions;
create policy "Users can update own ai chat sessions" on public.ai_chat_sessions for update
to authenticated using (
  created_by_user_id = (select auth.uid())
  and (select private.user_has_family_access(family_id))
)
with check (
  created_by_user_id = (select auth.uid())
  and (select private.user_has_family_access(family_id))
);

drop policy if exists "Users can read accessible ai actions" on public.ai_actions;
create policy "Users can read accessible ai actions" on public.ai_actions for select
to authenticated using (
  (
    privacy_level = 'private'
    and requested_by_user_id = (select auth.uid())
  )
  or (
    privacy_level <> 'private'
    and (select private.user_has_family_access(family_id))
  )
  or (
    privacy_level = 'caregiver_shared'
    and family_member_id is not null
    and (select private.user_has_child_caregiver_access(family_member_id))
  )
);

drop policy if exists "Users can create own ai actions" on public.ai_actions;
create policy "Users can create own ai actions" on public.ai_actions for insert
to authenticated with check (
  requested_by_user_id = (select auth.uid())
  and (
    (select private.user_has_family_access(family_id))
    or (
      privacy_level = 'caregiver_shared'
      and family_member_id is not null
      and (select private.user_has_child_caregiver_access(family_member_id))
    )
  )
);

drop policy if exists "Users can update own pending ai actions" on public.ai_actions;
create policy "Users can update own pending ai actions" on public.ai_actions for update
to authenticated using (
  requested_by_user_id = (select auth.uid())
  and status in ('pending', 'running')
)
with check (
  requested_by_user_id = (select auth.uid())
  and (select private.user_has_family_access(family_id))
);

drop policy if exists "Users can delete own pending ai actions" on public.ai_actions;
create policy "Users can delete own pending ai actions" on public.ai_actions for delete
to authenticated using (
  requested_by_user_id = (select auth.uid())
  and status = 'pending'
);

drop policy if exists "Users can manage own device tokens" on public.device_tokens;
create policy "Users can manage own device tokens" on public.device_tokens for all
to authenticated using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

drop policy if exists "Users can manage own settings" on public.user_settings;
create policy "Users can manage own settings" on public.user_settings for all
to authenticated using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

drop policy if exists "Admins can delete caregiver access" on public.caregiver_child_access;
create policy "Admins can delete caregiver access" on public.caregiver_child_access for delete
to authenticated using ((select private.user_can_admin_family(family_id)));

drop policy if exists "Caregivers can update own access status" on public.caregiver_child_access;
create policy "Caregivers can update own access status" on public.caregiver_child_access for update
to authenticated using (caregiver_user_id = (select auth.uid()))
with check (
  caregiver_user_id = (select auth.uid())
  and status in ('active', 'paused')
);

drop policy if exists "Users can read own sharing permissions" on public.sharing_permissions;
create policy "Users can read own sharing permissions" on public.sharing_permissions for select
to authenticated using (
  grantee_user_id = (select auth.uid())
  or created_by_user_id = (select auth.uid())
  or (select private.user_has_family_access(family_id))
);

drop policy if exists "Family users can manage sharing permissions" on public.sharing_permissions;

drop policy if exists "Admins and creators can insert sharing permissions" on public.sharing_permissions;
create policy "Admins and creators can insert sharing permissions" on public.sharing_permissions for insert
to authenticated with check (
  created_by_user_id = (select auth.uid())
  and (select private.user_can_admin_family(family_id))
);

drop policy if exists "Admins and creators can update sharing permissions" on public.sharing_permissions;
create policy "Admins and creators can update sharing permissions" on public.sharing_permissions for update
to authenticated using (
  created_by_user_id = (select auth.uid())
  or (select private.user_can_admin_family(family_id))
)
with check (
  (created_by_user_id = (select auth.uid()) or (select private.user_can_admin_family(family_id)))
  and (select private.user_has_family_access(family_id))
);

drop policy if exists "Admins and creators can delete sharing permissions" on public.sharing_permissions;
create policy "Admins and creators can delete sharing permissions" on public.sharing_permissions for delete
to authenticated using (
  created_by_user_id = (select auth.uid())
  or (select private.user_can_admin_family(family_id))
);

drop policy if exists "Users can update own notifications" on public.notifications;
create policy "Users can update own notifications" on public.notifications for update
to authenticated using (recipient_user_id = (select auth.uid()))
with check (recipient_user_id = (select auth.uid()));

drop policy if exists "Users can create audit logs" on public.audit_logs;
create policy "Users can create audit logs" on public.audit_logs for insert
to authenticated with check (
  actor_user_id = (select auth.uid())
  and (
    family_id is null
    or (select private.user_has_family_access(family_id))
  )
);

do $$
declare
  target_table text;
begin
  foreach target_table in array array[
    'users',
    'health_records',
    'ai_chat_sessions',
    'ai_actions',
    'device_tokens',
    'user_settings'
  ] loop
    execute format('drop trigger if exists %I_set_updated_at on public.%I', target_table, target_table);
    execute format('create trigger %I_set_updated_at before update on public.%I for each row execute function public.set_updated_at()', target_table, target_table);
  end loop;
end $$;

create or replace function public.handle_new_user_core_defaults()
returns trigger
set search_path = pg_catalog, public
language plpgsql
security definer
as $$
declare
  display_name text := coalesce(nullif(btrim(new.raw_user_meta_data->>'full_name'), ''), split_part(coalesce(new.email, new.phone, 'New account'), '@', 1));
begin
  insert into public.users (id, email, phone, display_name)
  values (new.id, new.email, coalesce(new.phone, new.raw_user_meta_data->>'phone'), display_name)
  on conflict (id) do update set
    email = excluded.email,
    phone = coalesce(public.users.phone, excluded.phone),
    display_name = coalesce(public.users.display_name, excluded.display_name);

  insert into public.user_settings (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

revoke execute on function public.handle_new_user_core_defaults() from public, anon, authenticated;

drop trigger if exists on_auth_user_created_core_defaults on auth.users;
create trigger on_auth_user_created_core_defaults
  after insert on auth.users
  for each row execute function public.handle_new_user_core_defaults();

insert into public.users (id, email, phone, display_name, created_at, updated_at)
select
  au.id,
  au.email,
  au.phone,
  coalesce(nullif(btrim(au.raw_user_meta_data->>'full_name'), ''), split_part(coalesce(au.email, au.phone, 'New account'), '@', 1)),
  au.created_at,
  timezone('utc', now())
from auth.users au
on conflict (id) do update set
  email = excluded.email,
  phone = coalesce(public.users.phone, excluded.phone),
  display_name = coalesce(public.users.display_name, excluded.display_name);

insert into public.user_settings (user_id)
select au.id
from auth.users au
on conflict (user_id) do nothing;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'users',
    'health_records',
    'ai_chat_sessions',
    'ai_actions',
    'device_tokens',
    'user_settings'
  ] loop
    if to_regclass(format('public.%I', table_name)) is not null
      and not exists (
        select 1
        from pg_publication_tables
        where pubname = 'supabase_realtime'
          and schemaname = 'public'
          and tablename = table_name
      )
    then
      execute format('alter publication supabase_realtime add table public.%I', table_name);
    end if;
  end loop;
end $$;
