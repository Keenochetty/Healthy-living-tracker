create extension if not exists pgcrypto;

create table if not exists public.care_profiles (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  profile_type text not null default 'self'
    check (profile_type in ('self', 'child', 'dependent', 'elder', 'pregnancy_subject', 'caregiver_contact', 'other')),
  display_name text not null,
  legal_name text,
  relationship_label text,
  date_of_birth date,
  gender_context text,
  avatar_url text,
  avatar_storage_path text,
  privacy_scope text not null default 'private'
    check (privacy_scope in ('private', 'selected_family', 'caregiver_limited', 'emergency_only')),
  managed_by_user_id uuid references auth.users(id) on delete set null,
  adult_owner_user_id uuid references auth.users(id) on delete set null,
  is_primary_self boolean not null default false,
  status text not null default 'active'
    check (status in ('active', 'inactive', 'archived', 'pending')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.care_profile_relationships (
  id uuid primary key default gen_random_uuid(),
  care_profile_id uuid not null references public.care_profiles(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  relationship_type text not null
    check (relationship_type in ('self', 'parent', 'guardian', 'adult_owner', 'dependent_manager', 'caregiver', 'viewer')),
  status text not null default 'active'
    check (status in ('active', 'inactive', 'archived', 'pending')),
  is_primary_manager boolean not null default false,
  can_manage_identity boolean not null default false,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (care_profile_id, user_id, relationship_type)
);

create table if not exists public.active_care_profile_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade unique,
  active_care_profile_id uuid references public.care_profiles(id) on delete set null,
  last_selected_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists care_profiles_owner_user_id_idx
  on public.care_profiles(owner_user_id);

create index if not exists care_profiles_managed_by_user_id_idx
  on public.care_profiles(managed_by_user_id)
  where managed_by_user_id is not null;

create unique index if not exists care_profiles_primary_self_user_idx
  on public.care_profiles(owner_user_id)
  where is_primary_self = true and status = 'active';

create index if not exists care_profile_relationships_profile_id_idx
  on public.care_profile_relationships(care_profile_id);

create index if not exists care_profile_relationships_user_status_idx
  on public.care_profile_relationships(user_id, status);

create index if not exists active_care_profile_preferences_user_id_idx
  on public.active_care_profile_preferences(user_id);

drop trigger if exists care_profiles_set_updated_at on public.care_profiles;
create trigger care_profiles_set_updated_at
before update on public.care_profiles
for each row execute function public.set_updated_at();

drop trigger if exists care_profile_relationships_set_updated_at on public.care_profile_relationships;
create trigger care_profile_relationships_set_updated_at
before update on public.care_profile_relationships
for each row execute function public.set_updated_at();

drop trigger if exists active_care_profile_preferences_set_updated_at on public.active_care_profile_preferences;
create trigger active_care_profile_preferences_set_updated_at
before update on public.active_care_profile_preferences
for each row execute function public.set_updated_at();

alter table public.care_profiles enable row level security;
alter table public.care_profile_relationships enable row level security;
alter table public.active_care_profile_preferences enable row level security;

grant select, insert, update on
  public.care_profiles,
  public.care_profile_relationships,
  public.active_care_profile_preferences
to authenticated;

drop policy if exists "Users can read owned or related care profiles" on public.care_profiles;
create policy "Users can read owned or related care profiles"
on public.care_profiles for select
to authenticated
using (
  owner_user_id = (select auth.uid())
  or managed_by_user_id = (select auth.uid())
  or adult_owner_user_id = (select auth.uid())
  or exists (
    select 1
    from public.care_profile_relationships rel
    where rel.care_profile_id = care_profiles.id
      and rel.user_id = (select auth.uid())
      and rel.status = 'active'
  )
);

drop policy if exists "Users can create own care profiles" on public.care_profiles;
create policy "Users can create own care profiles"
on public.care_profiles for insert
to authenticated
with check (
  owner_user_id = (select auth.uid())
  and (
    managed_by_user_id is null
    or managed_by_user_id = (select auth.uid())
  )
);

drop policy if exists "Owners and identity managers can update care profiles" on public.care_profiles;
create policy "Owners and identity managers can update care profiles"
on public.care_profiles for update
to authenticated
using (
  owner_user_id = (select auth.uid())
  or managed_by_user_id = (select auth.uid())
  or adult_owner_user_id = (select auth.uid())
  or exists (
    select 1
    from public.care_profile_relationships rel
    where rel.care_profile_id = care_profiles.id
      and rel.user_id = (select auth.uid())
      and rel.status = 'active'
      and rel.can_manage_identity
  )
)
with check (
  owner_user_id = (select auth.uid())
  or managed_by_user_id = (select auth.uid())
  or adult_owner_user_id = (select auth.uid())
);

drop policy if exists "Users can read own care profile relationships" on public.care_profile_relationships;
create policy "Users can read own care profile relationships"
on public.care_profile_relationships for select
to authenticated
using (
  user_id = (select auth.uid())
  or created_by = (select auth.uid())
);

drop policy if exists "Care profile owners can create relationships" on public.care_profile_relationships;
create policy "Care profile owners can create relationships"
on public.care_profile_relationships for insert
to authenticated
with check (
  created_by = (select auth.uid())
  and exists (
    select 1
    from public.care_profiles profile
    where profile.id = care_profile_relationships.care_profile_id
      and (
        profile.owner_user_id = (select auth.uid())
        or profile.managed_by_user_id = (select auth.uid())
        or profile.adult_owner_user_id = (select auth.uid())
      )
  )
);

drop policy if exists "Care profile owners can update relationships" on public.care_profile_relationships;
create policy "Care profile owners can update relationships"
on public.care_profile_relationships for update
to authenticated
using (
  exists (
    select 1
    from public.care_profiles profile
    where profile.id = care_profile_relationships.care_profile_id
      and (
        profile.owner_user_id = (select auth.uid())
        or profile.managed_by_user_id = (select auth.uid())
        or profile.adult_owner_user_id = (select auth.uid())
      )
  )
)
with check (
  exists (
    select 1
    from public.care_profiles profile
    where profile.id = care_profile_relationships.care_profile_id
      and (
        profile.owner_user_id = (select auth.uid())
        or profile.managed_by_user_id = (select auth.uid())
        or profile.adult_owner_user_id = (select auth.uid())
      )
  )
);

drop policy if exists "Users can read own active care profile preference" on public.active_care_profile_preferences;
create policy "Users can read own active care profile preference"
on public.active_care_profile_preferences for select
to authenticated
using (user_id = (select auth.uid()));

drop policy if exists "Users can create own active care profile preference" on public.active_care_profile_preferences;
create policy "Users can create own active care profile preference"
on public.active_care_profile_preferences for insert
to authenticated
with check (user_id = (select auth.uid()));

drop policy if exists "Users can update own active care profile preference" on public.active_care_profile_preferences;
create policy "Users can update own active care profile preference"
on public.active_care_profile_preferences for update
to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

comment on table public.care_profiles is
  'HealthOS Batch 2 identity foundation for self, child, dependent, pregnancy-subject, elder, and caregiver-contact care profiles. This table stores identity metadata only, not clinical records.';

comment on table public.care_profile_relationships is
  'HealthOS Batch 2 relationship foundation between authenticated users and care profiles. This is not a full sharing or permission model.';

comment on table public.active_care_profile_preferences is
  'HealthOS Batch 2 per-user active care profile selector used by app surfaces to scope future reads.';
