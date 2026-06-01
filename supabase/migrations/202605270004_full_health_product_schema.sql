create extension if not exists pgcrypto;

create schema if not exists private;

do $$ begin
  create type public.family_role as enum ('owner', 'admin', 'member', 'caregiver');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.family_invite_status as enum ('pending', 'accepted', 'revoked', 'expired');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.family_member_profile_type as enum (
    'adult_male',
    'adult_female',
    'pregnant_mother',
    'postpartum_mother',
    'baby',
    'child',
    'elderly_family_member',
    'caregiver'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.gender_type as enum ('male', 'female', 'other', 'prefer_not_to_say');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.tracking_category as enum (
    'symptom',
    'medicine',
    'temperature',
    'blood_pressure',
    'weight',
    'mood',
    'pain',
    'sleep',
    'feeding',
    'diaper',
    'vaccination',
    'doctor_visit'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.document_category as enum (
    'doctor_report',
    'lab_result',
    'prescription',
    'scan_image',
    'vaccination_card',
    'medical_note',
    'general_document'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.reminder_status as enum ('pending', 'completed', 'dismissed', 'cancelled');
exception when duplicate_object then null;
end $$;

alter table public.profiles
  add column if not exists default_family_id uuid,
  add column if not exists avatar_url text;

alter table public.families
  add column if not exists household_notes text;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'family_members'
      and column_name = 'full_name'
  ) and not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'family_members'
      and column_name = 'name'
  ) then
    alter table public.family_members rename column full_name to name;
  end if;
end $$;

alter table public.family_members
  add column if not exists profile_type public.family_member_profile_type not null default 'adult_male',
  add column if not exists date_of_birth date,
  add column if not exists gender public.gender_type,
  add column if not exists medical_notes text,
  add column if not exists doctor_details text,
  add column if not exists emergency_notes text;

create table if not exists public.family_memberships (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.family_role not null default 'member',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (family_id, user_id)
);

create table if not exists public.family_invites (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  invited_email text not null,
  role public.family_role not null default 'member',
  status public.family_invite_status not null default 'pending',
  token text not null unique default encode(gen_random_bytes(24), 'hex'),
  invited_by_user_id uuid not null references auth.users(id) on delete cascade,
  accepted_by_user_id uuid references auth.users(id) on delete set null,
  expires_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.health_logs (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  family_member_id uuid not null references public.family_members(id) on delete cascade,
  created_by_user_id uuid not null references auth.users(id) on delete cascade,
  category public.tracking_category not null,
  logged_at timestamptz not null default timezone('utc', now()),
  title text not null,
  notes text,
  severity integer check (severity between 0 and 10),
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.medicine_logs (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  family_member_id uuid not null references public.family_members(id) on delete cascade,
  created_by_user_id uuid not null references auth.users(id) on delete cascade,
  medicine_name text not null,
  dosage text,
  taken_at timestamptz not null default timezone('utc', now()),
  next_dose_at timestamptz,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.temperature_logs (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  family_member_id uuid not null references public.family_members(id) on delete cascade,
  created_by_user_id uuid not null references auth.users(id) on delete cascade,
  temperature_c numeric(4,1) not null,
  measured_at timestamptz not null default timezone('utc', now()),
  method text,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.doctor_visits (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  family_member_id uuid not null references public.family_members(id) on delete cascade,
  created_by_user_id uuid not null references auth.users(id) on delete cascade,
  doctor_name text,
  visit_at timestamptz not null,
  reason text not null,
  notes text,
  follow_up_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  family_member_id uuid not null references public.family_members(id) on delete cascade,
  created_by_user_id uuid not null references auth.users(id) on delete cascade,
  uploaded_by_user_id uuid not null references auth.users(id) on delete cascade,
  category public.document_category not null default 'general_document',
  storage_bucket text not null default 'medical-documents',
  storage_path text not null unique,
  file_name text not null,
  content_type text,
  file_size bigint,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.reminders (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  family_member_id uuid references public.family_members(id) on delete cascade,
  created_by_user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  reminder_type text not null,
  due_at timestamptz not null,
  status public.reminder_status not null default 'pending',
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.ai_chats (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  family_member_id uuid references public.family_members(id) on delete set null,
  created_by_user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'New health chat',
  category_filters public.tracking_category[] not null default '{}',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.ai_messages (
  id uuid primary key default gen_random_uuid(),
  chat_id uuid not null references public.ai_chats(id) on delete cascade,
  family_id uuid not null references public.families(id) on delete cascade,
  family_member_id uuid references public.family_members(id) on delete set null,
  created_by_user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  attachment_document_id uuid references public.documents(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  plan text not null default 'free',
  status text not null default 'active',
  current_period_end timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (family_id, user_id)
);

-- Existing linked projects may already have older versions of these tables.
-- Add ownership columns before policy/index creation so this migration remains idempotent.
alter table public.health_logs add column if not exists created_by_user_id uuid references auth.users(id) on delete cascade;
alter table public.medicine_logs add column if not exists created_by_user_id uuid references auth.users(id) on delete cascade;
alter table public.temperature_logs add column if not exists created_by_user_id uuid references auth.users(id) on delete cascade;
alter table public.doctor_visits add column if not exists created_by_user_id uuid references auth.users(id) on delete cascade;
alter table public.documents add column if not exists created_by_user_id uuid references auth.users(id) on delete cascade;
alter table public.documents add column if not exists uploaded_by_user_id uuid references auth.users(id) on delete cascade;
alter table public.reminders add column if not exists created_by_user_id uuid references auth.users(id) on delete cascade;
alter table public.ai_chats add column if not exists created_by_user_id uuid references auth.users(id) on delete cascade;
alter table public.ai_messages add column if not exists created_by_user_id uuid references auth.users(id) on delete cascade;
alter table public.subscriptions add column if not exists created_by_user_id uuid references auth.users(id) on delete cascade;

create index if not exists family_memberships_family_id_idx on public.family_memberships(family_id);
create index if not exists family_memberships_user_id_idx on public.family_memberships(user_id);
create index if not exists family_invites_family_id_idx on public.family_invites(family_id);
create index if not exists family_invites_invited_email_idx on public.family_invites(lower(invited_email));
create index if not exists health_logs_family_member_logged_idx on public.health_logs(family_id, family_member_id, logged_at desc);
create index if not exists health_logs_created_by_user_id_idx on public.health_logs(created_by_user_id);
create index if not exists medicine_logs_family_member_taken_idx on public.medicine_logs(family_id, family_member_id, taken_at desc);
create index if not exists medicine_logs_next_dose_idx on public.medicine_logs(family_id, next_dose_at);
create index if not exists temperature_logs_family_member_measured_idx on public.temperature_logs(family_id, family_member_id, measured_at desc);
create index if not exists doctor_visits_family_visit_idx on public.doctor_visits(family_id, visit_at desc);
create index if not exists documents_family_member_idx on public.documents(family_id, family_member_id, created_at desc);
create index if not exists reminders_family_due_idx on public.reminders(family_id, due_at, status);
create index if not exists ai_chats_family_updated_idx on public.ai_chats(family_id, updated_at desc);
create index if not exists ai_messages_chat_created_idx on public.ai_messages(chat_id, created_at);
create index if not exists subscriptions_family_user_idx on public.subscriptions(family_id, user_id);

create or replace function private.user_has_family_access(target_family_id uuid)
returns boolean
language sql
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.family_memberships fm
    where fm.family_id = target_family_id
      and fm.user_id = (select auth.uid())
  );
$$;

create or replace function private.user_can_admin_family(target_family_id uuid)
returns boolean
language sql
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.family_memberships fm
    where fm.family_id = target_family_id
      and fm.user_id = (select auth.uid())
      and fm.role in ('owner', 'admin')
  );
$$;

revoke execute on function private.user_has_family_access(uuid) from public, anon, authenticated, service_role;
revoke execute on function private.user_can_admin_family(uuid) from public, anon, authenticated, service_role;

create or replace function public.handle_new_user()
returns trigger
set search_path = pg_catalog, public
language plpgsql
security definer
as $$
declare
  new_family_id uuid;
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name')
  on conflict (id) do update set
    email = excluded.email,
    full_name = coalesce(public.profiles.full_name, excluded.full_name);

  insert into public.families (owner_id, name)
  values (new.id, coalesce(nullif(new.raw_user_meta_data->>'full_name', ''), 'My') || ' Family')
  returning id into new_family_id;

  insert into public.family_memberships (family_id, user_id, role)
  values (new_family_id, new.id, 'owner')
  on conflict do nothing;

  update public.profiles
  set default_family_id = new_family_id
  where id = new.id and default_family_id is null;

  insert into public.subscriptions (family_id, user_id, plan, status)
  values (new_family_id, new.id, 'free', 'active')
  on conflict do nothing;

  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'profiles',
    'families',
    'family_members',
    'family_memberships',
    'family_invites',
    'health_logs',
    'medicine_logs',
    'temperature_logs',
    'doctor_visits',
    'documents',
    'reminders',
    'ai_chats',
    'ai_messages'
  ] loop
    execute format('alter table public.%I enable row level security', table_name);
  end loop;
end $$;

drop policy if exists "Users can read accessible subscriptions" on public.subscriptions;
create policy "Users can read accessible subscriptions" on public.subscriptions for select
to authenticated using ((select private.user_has_family_access(family_id)));

drop policy if exists "Users can create own subscriptions" on public.subscriptions;
create policy "Users can create own subscriptions" on public.subscriptions for insert
to authenticated with check ((select private.user_has_family_access(family_id)) and user_id = (select auth.uid()));

drop policy if exists "Users can update own subscriptions" on public.subscriptions;
create policy "Users can update own subscriptions" on public.subscriptions for update
to authenticated using ((select private.user_has_family_access(family_id)) and user_id = (select auth.uid()))
with check ((select private.user_has_family_access(family_id)) and user_id = (select auth.uid()));

grant usage on schema public to authenticated;
grant select, insert, update, delete on
  public.profiles,
  public.families,
  public.family_members,
  public.family_memberships,
  public.family_invites,
  public.health_logs,
  public.medicine_logs,
  public.temperature_logs,
  public.doctor_visits,
  public.documents,
  public.reminders,
  public.ai_chats,
  public.ai_messages,
  public.subscriptions
to authenticated;

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile" on public.profiles for select
to authenticated using ((select auth.uid()) = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles for update
to authenticated using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

drop policy if exists "Users can read accessible families" on public.families;
create policy "Users can read accessible families" on public.families for select
to authenticated using ((select private.user_has_family_access(id)));

drop policy if exists "Users can create owned families" on public.families;
create policy "Users can create owned families" on public.families for insert
to authenticated with check ((select auth.uid()) = owner_id);

drop policy if exists "Admins can update families" on public.families;
create policy "Admins can update families" on public.families for update
to authenticated using ((select private.user_can_admin_family(id)))
with check ((select private.user_can_admin_family(id)));

drop policy if exists "Owners can delete families" on public.families;
create policy "Owners can delete families" on public.families for delete
to authenticated using ((select auth.uid()) = owner_id);

drop policy if exists "Users can read accessible memberships" on public.family_memberships;
create policy "Users can read accessible memberships" on public.family_memberships for select
to authenticated using (((select auth.uid()) = user_id) or (select private.user_has_family_access(family_id)));

drop policy if exists "Admins can manage memberships" on public.family_memberships;
create policy "Admins can manage memberships" on public.family_memberships for all
to authenticated using ((select private.user_can_admin_family(family_id)))
with check ((select private.user_can_admin_family(family_id)));

drop policy if exists "Users can read accessible family members" on public.family_members;
create policy "Users can read accessible family members" on public.family_members for select
to authenticated using ((select private.user_has_family_access(family_id)));

drop policy if exists "Users can manage accessible family members" on public.family_members;
create policy "Users can manage accessible family members" on public.family_members for all
to authenticated using ((select private.user_has_family_access(family_id)))
with check ((select private.user_has_family_access(family_id)));

drop policy if exists "Admins can manage family invites" on public.family_invites;
create policy "Admins can manage family invites" on public.family_invites for all
to authenticated using ((select private.user_can_admin_family(family_id)))
with check ((select private.user_can_admin_family(family_id)) and invited_by_user_id = (select auth.uid()));

drop policy if exists "Users can read own invites" on public.family_invites;
create policy "Users can read own invites" on public.family_invites for select
to authenticated using (
  lower(invited_email) = lower(coalesce((select auth.jwt()->>'email'), ''))
  or (select private.user_has_family_access(family_id))
);

do $$
declare
  tbl text;
begin
  foreach tbl in array array[
    'health_logs',
    'medicine_logs',
    'temperature_logs',
    'doctor_visits',
    'documents',
    'reminders',
    'ai_chats',
    'ai_messages',
    'subscriptions'
  ] loop
    execute format('drop policy if exists "Users can read accessible %1$s" on public.%1$I', tbl);
    execute format('create policy "Users can read accessible %1$s" on public.%1$I for select to authenticated using ((select private.user_has_family_access(family_id)))', tbl);

    execute format('drop policy if exists "Users can create accessible %1$s" on public.%1$I', tbl);
    execute format('create policy "Users can create accessible %1$s" on public.%1$I for insert to authenticated with check ((select private.user_has_family_access(family_id)) and created_by_user_id = (select auth.uid()))', tbl);

    execute format('drop policy if exists "Users can update own accessible %1$s" on public.%1$I', tbl);
    execute format('create policy "Users can update own accessible %1$s" on public.%1$I for update to authenticated using ((select private.user_has_family_access(family_id)) and created_by_user_id = (select auth.uid())) with check ((select private.user_has_family_access(family_id)) and created_by_user_id = (select auth.uid()))', tbl);

    execute format('drop policy if exists "Users can delete own accessible %1$s" on public.%1$I', tbl);
    execute format('create policy "Users can delete own accessible %1$s" on public.%1$I for delete to authenticated using ((select private.user_has_family_access(family_id)) and created_by_user_id = (select auth.uid()))', tbl);
  end loop;
end $$;

insert into storage.buckets (id, name, public)
values ('medical-documents', 'medical-documents', false)
on conflict (id) do update set public = false;

drop policy if exists "Family users can read private medical documents" on storage.objects;
create policy "Family users can read private medical documents" on storage.objects for select
to authenticated
using (
  bucket_id = 'medical-documents'
  and (select private.user_has_family_access(((storage.foldername(name))[1])::uuid))
);

drop policy if exists "Family users can upload private medical documents" on storage.objects;
create policy "Family users can upload private medical documents" on storage.objects for insert
to authenticated
with check (
  bucket_id = 'medical-documents'
  and (select private.user_has_family_access(((storage.foldername(name))[1])::uuid))
);

drop policy if exists "Family users can update private medical documents" on storage.objects;
create policy "Family users can update private medical documents" on storage.objects for update
to authenticated
using (
  bucket_id = 'medical-documents'
  and (select private.user_has_family_access(((storage.foldername(name))[1])::uuid))
)
with check (
  bucket_id = 'medical-documents'
  and (select private.user_has_family_access(((storage.foldername(name))[1])::uuid))
);

drop policy if exists "Family users can delete private medical documents" on storage.objects;
create policy "Family users can delete private medical documents" on storage.objects for delete
to authenticated
using (
  bucket_id = 'medical-documents'
  and (select private.user_has_family_access(((storage.foldername(name))[1])::uuid))
);

do $$
declare
  target_table text;
begin
  foreach target_table in array array[
    'family_memberships',
    'family_invites',
    'health_logs',
    'medicine_logs',
    'temperature_logs',
    'doctor_visits',
    'documents',
    'reminders',
    'ai_chats',
    'ai_messages',
    'subscriptions'
  ] loop
    execute format('drop trigger if exists %I_set_updated_at on public.%I', target_table, target_table);
    execute format('create trigger %I_set_updated_at before update on public.%I for each row execute function public.set_updated_at()', target_table, target_table);
  end loop;
end $$;
