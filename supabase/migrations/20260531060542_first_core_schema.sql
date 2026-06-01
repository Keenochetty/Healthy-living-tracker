create extension if not exists pgcrypto;

do $$ begin
  create type public.app_role as enum (
    'parent_guardian',
    'caregiver',
    'woman',
    'man',
    'child',
    'baby',
    'elderly_dependent'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.privacy_level as enum (
    'private',
    'family_shared',
    'partner_shared',
    'caregiver_shared',
    'emergency_only'
  );
exception when duplicate_object then null;
end $$;

alter type public.privacy_level add value if not exists 'emergency_only';

do $$ begin
  create type public.notification_type as enum (
    'green_normal_update',
    'blue_calendar_activity',
    'yellow_attention',
    'orange_important_health',
    'red_emergency',
    'purple_ai_suggestion',
    'grey_system'
  );
exception when duplicate_object then null;
end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  display_name text,
  avatar_url text,
  primary_role public.app_role not null,
  date_of_birth date,
  gender text,
  is_onboarding_complete boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles
  add column if not exists full_name text,
  add column if not exists display_name text,
  add column if not exists avatar_url text,
  add column if not exists primary_role public.app_role,
  add column if not exists date_of_birth date,
  add column if not exists gender text,
  add column if not exists is_onboarding_complete boolean default false,
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

create table if not exists public.families (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_id uuid references public.profiles(id) on delete cascade,
  invite_code text unique,
  created_at timestamptz default now()
);

alter table public.families
  add column if not exists name text,
  add column if not exists owner_id uuid references public.profiles(id) on delete cascade,
  add column if not exists invite_code text unique,
  add column if not exists created_at timestamptz default now();

create table if not exists public.family_members (
  id uuid primary key default gen_random_uuid(),
  family_id uuid references public.families(id) on delete cascade,
  profile_id uuid references public.profiles(id) on delete cascade,
  role public.app_role not null,
  relationship text,
  can_manage_family boolean default false,
  created_at timestamptz default now(),
  unique(family_id, profile_id)
);

alter table public.family_members
  add column if not exists family_id uuid references public.families(id) on delete cascade,
  add column if not exists profile_id uuid references public.profiles(id) on delete cascade,
  add column if not exists role public.app_role,
  add column if not exists relationship text,
  add column if not exists can_manage_family boolean default false,
  add column if not exists created_at timestamptz default now();

do $$ begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'family_members_family_profile_key'
      and conrelid = 'public.family_members'::regclass
  ) then
    alter table public.family_members
      add constraint family_members_family_profile_key unique (family_id, profile_id);
  end if;
end $$;

create table if not exists public.children (
  id uuid primary key default gen_random_uuid(),
  family_id uuid references public.families(id) on delete cascade,
  first_name text not null,
  last_name text,
  date_of_birth date,
  gender text,
  avatar_url text,
  notes text,
  created_by uuid references public.profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.children
  add column if not exists family_id uuid references public.families(id) on delete cascade,
  add column if not exists first_name text,
  add column if not exists last_name text,
  add column if not exists date_of_birth date,
  add column if not exists gender text,
  add column if not exists avatar_url text,
  add column if not exists notes text,
  add column if not exists created_by uuid references public.profiles(id),
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

create table if not exists public.caregiver_profiles (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete cascade,
  bio text,
  emergency_contact_name text,
  emergency_contact_phone text,
  created_at timestamptz default now()
);

alter table public.caregiver_profiles
  add column if not exists profile_id uuid references public.profiles(id) on delete cascade,
  add column if not exists bio text,
  add column if not exists emergency_contact_name text,
  add column if not exists emergency_contact_phone text,
  add column if not exists created_at timestamptz default now();

create table if not exists public.caregiver_child_access (
  id uuid primary key default gen_random_uuid(),
  caregiver_profile_id uuid references public.caregiver_profiles(id) on delete cascade,
  child_id uuid references public.children(id) on delete cascade,
  family_id uuid references public.families(id) on delete cascade,
  granted_by uuid references public.profiles(id),
  can_view_care_instructions boolean default true,
  can_view_schedule boolean default true,
  can_log_activity boolean default true,
  can_upload_photos boolean default true,
  can_use_emergency_button boolean default true,
  is_active boolean default true,
  created_at timestamptz default now(),
  unique(caregiver_profile_id, child_id)
);

alter table public.caregiver_child_access
  add column if not exists caregiver_profile_id uuid references public.caregiver_profiles(id) on delete cascade,
  add column if not exists child_id uuid references public.children(id) on delete cascade,
  add column if not exists family_id uuid references public.families(id) on delete cascade,
  add column if not exists granted_by uuid references public.profiles(id),
  add column if not exists can_view_care_instructions boolean default true,
  add column if not exists can_view_schedule boolean default true,
  add column if not exists can_log_activity boolean default true,
  add column if not exists can_upload_photos boolean default true,
  add column if not exists can_use_emergency_button boolean default true,
  add column if not exists is_active boolean default true,
  add column if not exists created_at timestamptz default now();

do $$ begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'caregiver_child_access_profile_child_key'
      and conrelid = 'public.caregiver_child_access'::regclass
  ) then
    alter table public.caregiver_child_access
      add constraint caregiver_child_access_profile_child_key unique (caregiver_profile_id, child_id);
  end if;
end $$;

create table if not exists public.sharing_permissions (
  id uuid primary key default gen_random_uuid(),
  owner_profile_id uuid references public.profiles(id) on delete cascade,
  target_profile_id uuid references public.profiles(id) on delete cascade,
  child_id uuid references public.children(id) on delete cascade,
  privacy_level public.privacy_level not null,
  resource_type text not null,
  can_view boolean default false,
  can_create boolean default false,
  can_update boolean default false,
  can_delete boolean default false,
  created_at timestamptz default now()
);

alter table public.sharing_permissions
  add column if not exists owner_profile_id uuid references public.profiles(id) on delete cascade,
  add column if not exists target_profile_id uuid references public.profiles(id) on delete cascade,
  add column if not exists child_id uuid references public.children(id) on delete cascade,
  add column if not exists privacy_level public.privacy_level,
  add column if not exists resource_type text,
  add column if not exists can_view boolean default false,
  add column if not exists can_create boolean default false,
  add column if not exists can_update boolean default false,
  add column if not exists can_delete boolean default false,
  add column if not exists created_at timestamptz default now();

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_profile_id uuid references public.profiles(id) on delete cascade,
  sender_profile_id uuid references public.profiles(id),
  family_id uuid references public.families(id),
  child_id uuid references public.children(id),
  type public.notification_type not null,
  title text not null,
  safe_preview text not null,
  full_message text,
  is_sensitive boolean default false,
  requires_action boolean default false,
  action_type text,
  is_read boolean default false,
  created_at timestamptz default now()
);

alter table public.notifications
  add column if not exists recipient_profile_id uuid references public.profiles(id) on delete cascade,
  add column if not exists sender_profile_id uuid references public.profiles(id),
  add column if not exists family_id uuid references public.families(id),
  add column if not exists child_id uuid references public.children(id),
  add column if not exists type public.notification_type,
  add column if not exists title text,
  add column if not exists safe_preview text,
  add column if not exists full_message text,
  add column if not exists is_sensitive boolean default false,
  add column if not exists requires_action boolean default false,
  add column if not exists action_type text,
  add column if not exists is_read boolean default false,
  add column if not exists created_at timestamptz default now();

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_profile_id uuid references public.profiles(id),
  family_id uuid references public.families(id),
  child_id uuid references public.children(id),
  action text not null,
  resource_type text not null,
  resource_id uuid,
  metadata jsonb default '{}',
  created_at timestamptz default now()
);

alter table public.audit_logs
  add column if not exists actor_profile_id uuid references public.profiles(id),
  add column if not exists family_id uuid references public.families(id),
  add column if not exists child_id uuid references public.children(id),
  add column if not exists action text,
  add column if not exists resource_type text,
  add column if not exists resource_id uuid,
  add column if not exists metadata jsonb default '{}',
  add column if not exists created_at timestamptz default now();

create table if not exists public.user_settings (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete cascade,
  notification_preferences jsonb default '{}',
  privacy_preferences jsonb default '{}',
  ai_preferences jsonb default '{}',
  calendar_preferences jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(profile_id)
);

alter table public.user_settings
  add column if not exists id uuid default gen_random_uuid(),
  add column if not exists profile_id uuid references public.profiles(id) on delete cascade,
  add column if not exists notification_preferences jsonb default '{}',
  add column if not exists privacy_preferences jsonb default '{}',
  add column if not exists ai_preferences jsonb default '{}',
  add column if not exists calendar_preferences jsonb default '{}',
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

do $$ begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'user_settings_profile_id_key'
      and conrelid = 'public.user_settings'::regclass
  ) then
    alter table public.user_settings
      add constraint user_settings_profile_id_key unique (profile_id);
  end if;
end $$;

create table if not exists public.device_tokens (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete cascade,
  expo_push_token text,
  device_type text,
  device_name text,
  is_active boolean default true,
  created_at timestamptz default now(),
  unique(profile_id, expo_push_token)
);

alter table public.device_tokens
  add column if not exists profile_id uuid references public.profiles(id) on delete cascade,
  add column if not exists expo_push_token text,
  add column if not exists device_type text,
  add column if not exists device_name text,
  add column if not exists is_active boolean default true,
  add column if not exists created_at timestamptz default now();

do $$ begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'device_tokens_profile_token_key'
      and conrelid = 'public.device_tokens'::regclass
  ) then
    alter table public.device_tokens
      add constraint device_tokens_profile_token_key unique (profile_id, expo_push_token);
  end if;
end $$;

create index if not exists families_owner_id_idx on public.families(owner_id);
create index if not exists family_members_family_id_idx on public.family_members(family_id);
create index if not exists family_members_profile_id_idx on public.family_members(profile_id);
create index if not exists children_family_id_idx on public.children(family_id);
create index if not exists caregiver_profiles_profile_id_idx on public.caregiver_profiles(profile_id);
create index if not exists caregiver_child_access_child_id_idx on public.caregiver_child_access(child_id);
create index if not exists caregiver_child_access_family_id_idx on public.caregiver_child_access(family_id);
create index if not exists sharing_permissions_owner_target_idx on public.sharing_permissions(owner_profile_id, target_profile_id);
create index if not exists notifications_recipient_created_idx on public.notifications(recipient_profile_id, created_at desc);
create index if not exists audit_logs_family_created_idx on public.audit_logs(family_id, created_at desc);
create index if not exists device_tokens_profile_id_idx on public.device_tokens(profile_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare
  table_name text;
begin
  foreach table_name in array array['profiles', 'children', 'user_settings'] loop
    execute format('drop trigger if exists %I_set_updated_at on public.%I', table_name, table_name);
    execute format(
      'create trigger %I_set_updated_at before update on public.%I for each row execute function public.set_updated_at()',
      table_name,
      table_name
    );
  end loop;
end $$;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'profiles',
    'families',
    'family_members',
    'children',
    'caregiver_profiles',
    'caregiver_child_access',
    'sharing_permissions',
    'notifications',
    'audit_logs',
    'user_settings',
    'device_tokens'
  ] loop
    execute format('alter table public.%I enable row level security', table_name);
  end loop;
end $$;

grant usage on schema public to authenticated;
grant select, insert, update, delete on
  public.profiles,
  public.families,
  public.family_members,
  public.children,
  public.caregiver_profiles,
  public.caregiver_child_access,
  public.sharing_permissions,
  public.notifications,
  public.audit_logs,
  public.user_settings,
  public.device_tokens
to authenticated;

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile" on public.profiles for select
to authenticated using (id = (select auth.uid()));

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles for update
to authenticated using (id = (select auth.uid()))
with check (id = (select auth.uid()));

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile" on public.profiles for insert
to authenticated with check (id = (select auth.uid()));

drop policy if exists "Family managers can manage families" on public.families;
create policy "Family managers can manage families" on public.families for all
to authenticated using (owner_id = (select auth.uid()))
with check (owner_id = (select auth.uid()));

drop policy if exists "Family members can read family" on public.families;
create policy "Family members can read family" on public.families for select
to authenticated using (
  owner_id = (select auth.uid())
  or exists (
    select 1 from public.family_members
    where family_members.family_id = families.id
      and family_members.profile_id = (select auth.uid())
  )
);

drop policy if exists "Family users can read family members" on public.family_members;
create policy "Family users can read family members" on public.family_members for select
to authenticated using (
  profile_id = (select auth.uid())
  or exists (
    select 1 from public.families
    where families.id = family_members.family_id
      and families.owner_id = (select auth.uid())
  )
);

drop policy if exists "Family managers can manage family members" on public.family_members;
create policy "Family managers can manage family members" on public.family_members for all
to authenticated using (
  exists (
    select 1 from public.families
    where families.id = family_members.family_id
      and families.owner_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1 from public.families
    where families.id = family_members.family_id
      and families.owner_id = (select auth.uid())
  )
);

drop policy if exists "Family users can read children" on public.children;
create policy "Family users can read children" on public.children for select
to authenticated using (
  exists (
    select 1 from public.family_members
    where family_members.family_id = children.family_id
      and family_members.profile_id = (select auth.uid())
  )
  or exists (
    select 1 from public.families
    where families.id = children.family_id
      and families.owner_id = (select auth.uid())
  )
);

drop policy if exists "Family managers can manage children" on public.children;
create policy "Family managers can manage children" on public.children for all
to authenticated using (
  created_by = (select auth.uid())
  or exists (
    select 1 from public.families
    where families.id = children.family_id
      and families.owner_id = (select auth.uid())
  )
  or exists (
    select 1 from public.family_members manager
    where manager.family_id = children.family_id
      and manager.profile_id = (select auth.uid())
      and manager.can_manage_family
  )
)
with check (
  created_by = (select auth.uid())
  or exists (
    select 1 from public.families
    where families.id = children.family_id
      and families.owner_id = (select auth.uid())
  )
  or exists (
    select 1 from public.family_members manager
    where manager.family_id = children.family_id
      and manager.profile_id = (select auth.uid())
      and manager.can_manage_family
  )
);

drop policy if exists "Users can manage own caregiver profile" on public.caregiver_profiles;
create policy "Users can manage own caregiver profile" on public.caregiver_profiles for all
to authenticated using (profile_id = (select auth.uid()))
with check (profile_id = (select auth.uid()));

drop policy if exists "Family managers can manage caregiver access" on public.caregiver_child_access;
create policy "Family managers can manage caregiver access" on public.caregiver_child_access for all
to authenticated using (
  exists (
    select 1 from public.families
    where families.id = caregiver_child_access.family_id
      and families.owner_id = (select auth.uid())
  )
  or granted_by = (select auth.uid())
)
with check (
  exists (
    select 1 from public.families
    where families.id = caregiver_child_access.family_id
      and families.owner_id = (select auth.uid())
  )
  or granted_by = (select auth.uid())
);

drop policy if exists "Caregivers can read own child access" on public.caregiver_child_access;
create policy "Caregivers can read own child access" on public.caregiver_child_access for select
to authenticated using (
  exists (
    select 1 from public.caregiver_profiles
    where caregiver_profiles.id = caregiver_child_access.caregiver_profile_id
      and caregiver_profiles.profile_id = (select auth.uid())
  )
);

drop policy if exists "Users can manage sharing permissions they own" on public.sharing_permissions;
create policy "Users can manage sharing permissions they own" on public.sharing_permissions for all
to authenticated using (owner_profile_id = (select auth.uid()))
with check (owner_profile_id = (select auth.uid()));

drop policy if exists "Targets can read sharing permissions" on public.sharing_permissions;
create policy "Targets can read sharing permissions" on public.sharing_permissions for select
to authenticated using (target_profile_id = (select auth.uid()));

drop policy if exists "Users can read own notifications" on public.notifications;
create policy "Users can read own notifications" on public.notifications for select
to authenticated using (recipient_profile_id = (select auth.uid()));

drop policy if exists "Users can update own notifications" on public.notifications;
create policy "Users can update own notifications" on public.notifications for update
to authenticated using (recipient_profile_id = (select auth.uid()))
with check (recipient_profile_id = (select auth.uid()));

drop policy if exists "Family users can create notifications" on public.notifications;
create policy "Family users can create notifications" on public.notifications for insert
to authenticated with check (
  sender_profile_id = (select auth.uid())
  or exists (
    select 1 from public.families
    where families.id = notifications.family_id
      and families.owner_id = (select auth.uid())
  )
);

drop policy if exists "Family users can read audit logs" on public.audit_logs;
create policy "Family users can read audit logs" on public.audit_logs for select
to authenticated using (
  actor_profile_id = (select auth.uid())
  or exists (
    select 1 from public.families
    where families.id = audit_logs.family_id
      and families.owner_id = (select auth.uid())
  )
);

drop policy if exists "Users can create own audit logs" on public.audit_logs;
create policy "Users can create own audit logs" on public.audit_logs for insert
to authenticated with check (actor_profile_id = (select auth.uid()));

drop policy if exists "Users can manage own settings" on public.user_settings;
create policy "Users can manage own settings" on public.user_settings for all
to authenticated using (profile_id = (select auth.uid()))
with check (profile_id = (select auth.uid()));

drop policy if exists "Users can manage own device tokens" on public.device_tokens;
create policy "Users can manage own device tokens" on public.device_tokens for all
to authenticated using (profile_id = (select auth.uid()))
with check (profile_id = (select auth.uid()));
