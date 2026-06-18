create extension if not exists pgcrypto;

create table if not exists public.family_circles (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  avatar_url text,
  privacy_scope text not null default 'private'
    check (privacy_scope in ('private', 'circle', 'selected')),
  status text not null default 'active'
    check (status in ('active', 'inactive', 'archived')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.family_circle_members (
  id uuid primary key default gen_random_uuid(),
  circle_id uuid not null references public.family_circles(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  care_profile_id uuid references public.care_profiles(id) on delete set null,
  display_name text,
  email text,
  relationship_label text,
  role text not null default 'member'
    check (role in ('owner', 'admin', 'member', 'caregiver', 'viewer')),
  status text not null default 'active'
    check (status in ('active', 'pending', 'invited', 'declined', 'removed', 'inactive')),
  joined_at timestamptz,
  invited_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (circle_id, user_id)
);

create table if not exists public.family_invites (
  id uuid primary key default gen_random_uuid()
);

alter table public.family_invites
  add column if not exists circle_id uuid references public.family_circles(id) on delete cascade,
  add column if not exists invited_phone text,
  add column if not exists invited_user_id uuid references auth.users(id) on delete set null,
  add column if not exists invited_care_profile_id uuid references public.care_profiles(id) on delete set null,
  add column if not exists invited_by uuid references auth.users(id) on delete cascade,
  add column if not exists token_hash text,
  add column if not exists accepted_at timestamptz;

create table if not exists public.sharing_permissions (
  id uuid primary key default gen_random_uuid()
);

alter table public.sharing_permissions
  add column if not exists circle_id uuid references public.family_circles(id) on delete cascade,
  add column if not exists subject_care_profile_id uuid references public.care_profiles(id) on delete cascade,
  add column if not exists granted_by uuid references auth.users(id) on delete cascade,
  add column if not exists granted_to_user_id uuid references auth.users(id) on delete cascade,
  add column if not exists granted_to_member_id uuid references public.family_circle_members(id) on delete cascade,
  add column if not exists permission_key text,
  add column if not exists scope text not null default 'summary'
    check (scope in ('summary', 'limited', 'details', 'emergency', 'manage')),
  add column if not exists status text not null default 'active'
    check (status in ('active', 'inactive', 'expired', 'revoked'));

create table if not exists public.caregiver_assignments (
  id uuid primary key default gen_random_uuid(),
  circle_id uuid references public.family_circles(id) on delete cascade,
  caregiver_user_id uuid references auth.users(id) on delete cascade,
  caregiver_profile_id uuid references public.caregiver_profiles(id) on delete set null,
  subject_care_profile_id uuid not null references public.care_profiles(id) on delete cascade,
  assigned_by uuid not null references auth.users(id) on delete cascade,
  status text not null default 'active'
    check (status in ('active', 'inactive', 'ended')),
  access_level text not null default 'limited'
    check (access_level in ('limited', 'schedule_only', 'notes_only', 'custom')),
  can_add_notes boolean not null default false,
  can_view_schedule boolean not null default true,
  can_view_records boolean not null default false,
  can_view_medication_summary boolean not null default false,
  start_at timestamptz,
  end_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.family_shared_updates (
  id uuid primary key default gen_random_uuid(),
  circle_id uuid not null references public.family_circles(id) on delete cascade,
  author_user_id uuid not null references auth.users(id) on delete cascade,
  subject_care_profile_id uuid references public.care_profiles(id) on delete set null,
  update_type text not null default 'note',
  title text not null,
  body text,
  privacy_scope text not null default 'circle'
    check (privacy_scope in ('circle', 'selected', 'private')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists family_circles_created_by_idx on public.family_circles(created_by);
create index if not exists family_circle_members_circle_status_idx on public.family_circle_members(circle_id, status);
create index if not exists family_circle_members_user_status_idx on public.family_circle_members(user_id, status);
create index if not exists family_circle_members_care_profile_idx on public.family_circle_members(care_profile_id);
create index if not exists family_invites_circle_status_idx on public.family_invites(circle_id, status);
create index if not exists family_invites_invited_user_idx on public.family_invites(invited_user_id);
create index if not exists sharing_permissions_circle_key_idx on public.sharing_permissions(circle_id, permission_key, status);
create index if not exists sharing_permissions_granted_user_idx on public.sharing_permissions(granted_to_user_id, status);
create index if not exists sharing_permissions_subject_idx on public.sharing_permissions(subject_care_profile_id, permission_key, status);
create index if not exists caregiver_assignments_subject_idx on public.caregiver_assignments(subject_care_profile_id, status);
create index if not exists caregiver_assignments_caregiver_idx on public.caregiver_assignments(caregiver_user_id, status);
create index if not exists family_shared_updates_circle_created_idx on public.family_shared_updates(circle_id, created_at desc);

drop trigger if exists family_circles_set_updated_at on public.family_circles;
create trigger family_circles_set_updated_at
before update on public.family_circles
for each row execute function public.set_updated_at();

drop trigger if exists family_circle_members_set_updated_at on public.family_circle_members;
create trigger family_circle_members_set_updated_at
before update on public.family_circle_members
for each row execute function public.set_updated_at();

drop trigger if exists family_invites_set_updated_at on public.family_invites;
create trigger family_invites_set_updated_at
before update on public.family_invites
for each row execute function public.set_updated_at();

drop trigger if exists sharing_permissions_set_updated_at on public.sharing_permissions;
create trigger sharing_permissions_set_updated_at
before update on public.sharing_permissions
for each row execute function public.set_updated_at();

drop trigger if exists caregiver_assignments_set_updated_at on public.caregiver_assignments;
create trigger caregiver_assignments_set_updated_at
before update on public.caregiver_assignments
for each row execute function public.set_updated_at();

drop trigger if exists family_shared_updates_set_updated_at on public.family_shared_updates;
create trigger family_shared_updates_set_updated_at
before update on public.family_shared_updates
for each row execute function public.set_updated_at();

create or replace function public.is_active_circle_member(target_circle_id uuid, target_user_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.family_circle_members member
    where member.circle_id = target_circle_id
      and member.user_id = target_user_id
      and member.status = 'active'
  );
$$;

create or replace function public.is_circle_admin(target_circle_id uuid, target_user_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.family_circles circle
    where circle.id = target_circle_id
      and circle.created_by = target_user_id
      and circle.status = 'active'
  )
  or exists (
    select 1
    from public.family_circle_members member
    where member.circle_id = target_circle_id
      and member.user_id = target_user_id
      and member.status = 'active'
      and member.role in ('owner', 'admin')
  );
$$;

create or replace function public.is_subject_owner_or_manager(subject_profile_id uuid, target_user_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.care_profiles profile
    where profile.id = subject_profile_id
      and profile.status = 'active'
      and (
        profile.owner_user_id = target_user_id
        or profile.managed_by_user_id = target_user_id
        or profile.adult_owner_user_id = target_user_id
      )
  )
  or exists (
    select 1
    from public.care_profile_relationships relationship
    where relationship.care_profile_id = subject_profile_id
      and relationship.user_id = target_user_id
      and relationship.status = 'active'
      and relationship.can_manage_identity
  );
$$;

create or replace function public.has_family_permission(
  target_circle_id uuid,
  subject_profile_id uuid,
  target_user_id uuid,
  target_permission_key text
)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.sharing_permissions permission
    left join public.family_circle_members member
      on member.id = permission.granted_to_member_id
    where permission.circle_id = target_circle_id
      and permission.permission_key = target_permission_key
      and permission.status = 'active'
      and (permission.expires_at is null or permission.expires_at > timezone('utc', now()))
      and (
        permission.subject_care_profile_id = subject_profile_id
        or permission.subject_care_profile_id is null
      )
      and (
        permission.granted_to_user_id = target_user_id
        or member.user_id = target_user_id
      )
  );
$$;

create or replace function public.is_active_caregiver_for_subject(subject_profile_id uuid, target_user_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.caregiver_assignments assignment
    where assignment.subject_care_profile_id = subject_profile_id
      and assignment.caregiver_user_id = target_user_id
      and assignment.status = 'active'
      and (assignment.start_at is null or assignment.start_at <= timezone('utc', now()))
      and (assignment.end_at is null or assignment.end_at >= timezone('utc', now()))
  );
$$;

revoke all on function public.is_active_circle_member(uuid, uuid) from public;
revoke all on function public.is_circle_admin(uuid, uuid) from public;
revoke all on function public.is_subject_owner_or_manager(uuid, uuid) from public;
revoke all on function public.has_family_permission(uuid, uuid, uuid, text) from public;
revoke all on function public.is_active_caregiver_for_subject(uuid, uuid) from public;

grant execute on function public.is_active_circle_member(uuid, uuid) to authenticated;
grant execute on function public.is_circle_admin(uuid, uuid) to authenticated;
grant execute on function public.is_subject_owner_or_manager(uuid, uuid) to authenticated;
grant execute on function public.has_family_permission(uuid, uuid, uuid, text) to authenticated;
grant execute on function public.is_active_caregiver_for_subject(uuid, uuid) to authenticated;

alter table public.family_circles enable row level security;
alter table public.family_circle_members enable row level security;
alter table public.family_invites enable row level security;
alter table public.sharing_permissions enable row level security;
alter table public.caregiver_assignments enable row level security;
alter table public.family_shared_updates enable row level security;

grant select, insert, update on
  public.family_circles,
  public.family_circle_members,
  public.family_invites,
  public.sharing_permissions,
  public.caregiver_assignments,
  public.family_shared_updates
to authenticated;

drop policy if exists "Users can read own or member family circles" on public.family_circles;
create policy "Users can read own or member family circles"
on public.family_circles for select
to authenticated
using (
  created_by = (select auth.uid())
  or public.is_active_circle_member(id, (select auth.uid()))
);

drop policy if exists "Users can create family circles" on public.family_circles;
create policy "Users can create family circles"
on public.family_circles for insert
to authenticated
with check (created_by = (select auth.uid()));

drop policy if exists "Circle admins can update family circles" on public.family_circles;
create policy "Circle admins can update family circles"
on public.family_circles for update
to authenticated
using (public.is_circle_admin(id, (select auth.uid())))
with check (public.is_circle_admin(id, (select auth.uid())));

drop policy if exists "Users can read active family circle members" on public.family_circle_members;
create policy "Users can read active family circle members"
on public.family_circle_members for select
to authenticated
using (
  user_id = (select auth.uid())
  or public.is_active_circle_member(circle_id, (select auth.uid()))
  or public.is_circle_admin(circle_id, (select auth.uid()))
);

drop policy if exists "Circle admins can create family circle members" on public.family_circle_members;
create policy "Circle admins can create family circle members"
on public.family_circle_members for insert
to authenticated
with check (
  public.is_circle_admin(circle_id, (select auth.uid()))
  or exists (
    select 1
    from public.family_circles circle
    where circle.id = family_circle_members.circle_id
      and circle.created_by = (select auth.uid())
  )
);

drop policy if exists "Circle admins can update family circle members" on public.family_circle_members;
create policy "Circle admins can update family circle members"
on public.family_circle_members for update
to authenticated
using (public.is_circle_admin(circle_id, (select auth.uid())))
with check (public.is_circle_admin(circle_id, (select auth.uid())));

drop policy if exists "Circle admins and invitees can read family invites" on public.family_invites;
create policy "Circle admins and invitees can read family invites"
on public.family_invites for select
to authenticated
using (
  invited_by = (select auth.uid())
  or invited_by_user_id = (select auth.uid())
  or invited_user_id = (select auth.uid())
  or public.is_circle_admin(circle_id, (select auth.uid()))
  or lower(invited_email) = lower(coalesce((select auth.jwt()->>'email'), ''))
);

drop policy if exists "Circle admins can create family invites" on public.family_invites;
create policy "Circle admins can create family invites"
on public.family_invites for insert
to authenticated
with check (
  coalesce(invited_by, invited_by_user_id) = (select auth.uid())
  and public.is_circle_admin(circle_id, (select auth.uid()))
);

drop policy if exists "Circle admins can update family invites" on public.family_invites;
create policy "Circle admins can update family invites"
on public.family_invites for update
to authenticated
using (
  public.is_circle_admin(circle_id, (select auth.uid()))
  or invited_user_id = (select auth.uid())
)
with check (
  public.is_circle_admin(circle_id, (select auth.uid()))
  or invited_user_id = (select auth.uid())
);

drop policy if exists "Users can read relevant sharing permissions" on public.sharing_permissions;
create policy "Users can read relevant sharing permissions"
on public.sharing_permissions for select
to authenticated
using (
  granted_by = (select auth.uid())
  or granted_to_user_id = (select auth.uid())
  or public.is_circle_admin(circle_id, (select auth.uid()))
  or exists (
    select 1
    from public.family_circle_members member
    where member.id = sharing_permissions.granted_to_member_id
      and member.user_id = (select auth.uid())
      and member.status = 'active'
  )
);

drop policy if exists "Circle admins and subject managers can create sharing permissions" on public.sharing_permissions;
create policy "Circle admins and subject managers can create sharing permissions"
on public.sharing_permissions for insert
to authenticated
with check (
  granted_by = (select auth.uid())
  and (
    public.is_circle_admin(circle_id, (select auth.uid()))
    or public.is_subject_owner_or_manager(subject_care_profile_id, (select auth.uid()))
    or public.has_family_permission(circle_id, subject_care_profile_id, (select auth.uid()), 'manage_permissions')
  )
);

drop policy if exists "Circle admins and grantors can update sharing permissions" on public.sharing_permissions;
create policy "Circle admins and grantors can update sharing permissions"
on public.sharing_permissions for update
to authenticated
using (
  granted_by = (select auth.uid())
  or public.is_circle_admin(circle_id, (select auth.uid()))
  or public.has_family_permission(circle_id, subject_care_profile_id, (select auth.uid()), 'manage_permissions')
)
with check (
  granted_by = (select auth.uid())
  or public.is_circle_admin(circle_id, (select auth.uid()))
  or public.has_family_permission(circle_id, subject_care_profile_id, (select auth.uid()), 'manage_permissions')
);

drop policy if exists "Users can read relevant caregiver assignments" on public.caregiver_assignments;
create policy "Users can read relevant caregiver assignments"
on public.caregiver_assignments for select
to authenticated
using (
  caregiver_user_id = (select auth.uid())
  or assigned_by = (select auth.uid())
  or public.is_subject_owner_or_manager(subject_care_profile_id, (select auth.uid()))
);

drop policy if exists "Subject managers can create caregiver assignments" on public.caregiver_assignments;
create policy "Subject managers can create caregiver assignments"
on public.caregiver_assignments for insert
to authenticated
with check (
  assigned_by = (select auth.uid())
  and public.is_subject_owner_or_manager(subject_care_profile_id, (select auth.uid()))
);

drop policy if exists "Subject managers can update caregiver assignments" on public.caregiver_assignments;
create policy "Subject managers can update caregiver assignments"
on public.caregiver_assignments for update
to authenticated
using (
  assigned_by = (select auth.uid())
  or public.is_subject_owner_or_manager(subject_care_profile_id, (select auth.uid()))
)
with check (
  assigned_by = (select auth.uid())
  or public.is_subject_owner_or_manager(subject_care_profile_id, (select auth.uid()))
);

drop policy if exists "Active circle members can read shared updates" on public.family_shared_updates;
create policy "Active circle members can read shared updates"
on public.family_shared_updates for select
to authenticated
using (
  author_user_id = (select auth.uid())
  or public.is_active_circle_member(circle_id, (select auth.uid()))
  or public.has_family_permission(circle_id, subject_care_profile_id, (select auth.uid()), 'view_family_updates')
);

drop policy if exists "Active circle members can create shared updates" on public.family_shared_updates;
create policy "Active circle members can create shared updates"
on public.family_shared_updates for insert
to authenticated
with check (
  author_user_id = (select auth.uid())
  and public.is_active_circle_member(circle_id, (select auth.uid()))
);

comment on table public.family_circles is
  'HealthOS Batch 3 canonical family/care circles. Circle membership creates relationship context only and does not grant medical data access.';

comment on table public.family_circle_members is
  'HealthOS Batch 3 circle membership. Active membership grants circle visibility only, not health data.';

comment on table public.sharing_permissions is
  'HealthOS explicit sharing grants. Family membership alone must not be treated as permission for sensitive records, medication, child logs, pregnancy, or women''s health data.';

comment on table public.caregiver_assignments is
  'Limited caregiver assignment foundation. Records and medication access still require explicit sharing permissions.';

comment on table public.family_shared_updates is
  'Privacy-safe family updates only. Do not store detailed medical logs here.';
