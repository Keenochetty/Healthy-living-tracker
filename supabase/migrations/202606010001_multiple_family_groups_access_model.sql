create extension if not exists pgcrypto;

do $$ begin
  create type public.family_member_access_stage as enum (
    'child_0_12',
    'teen_13_17',
    'adult_18_plus'
  );
exception when duplicate_object then null;
end $$;

alter table public.family_memberships
  add column if not exists relationship text;

alter table public.family_members
  add column if not exists access_stage public.family_member_access_stage not null default 'adult_18_plus',
  add column if not exists self_managed_by_user_id uuid references auth.users(id) on delete set null,
  add column if not exists adult_private boolean not null default false;

create index if not exists family_memberships_family_role_idx
  on public.family_memberships(family_id, role);

create index if not exists family_members_access_stage_idx
  on public.family_members(family_id, access_stage);

create index if not exists family_members_self_managed_by_user_id_idx
  on public.family_members(self_managed_by_user_id)
  where self_managed_by_user_id is not null;

insert into public.family_memberships (family_id, user_id, role, relationship)
select families.id, families.owner_id, 'owner'::public.family_role, 'Owner'
from public.families
where families.owner_id is not null
on conflict (family_id, user_id) do update set
  role = case
    when public.family_memberships.role = 'owner' then public.family_memberships.role
    else excluded.role
  end,
  relationship = coalesce(public.family_memberships.relationship, excluded.relationship);

insert into public.family_memberships (family_id, user_id, role, relationship)
select
  family_members.family_id,
  family_members.profile_id,
  case
    when family_members.can_manage_family then 'admin'::public.family_role
    else 'member'::public.family_role
  end,
  family_members.relationship
from public.family_members
where family_members.profile_id is not null
on conflict (family_id, user_id) do update set
  role = case
    when public.family_memberships.role = 'owner' then 'owner'::public.family_role
    when excluded.role = 'admin' then 'admin'::public.family_role
    else public.family_memberships.role
  end,
  relationship = coalesce(public.family_memberships.relationship, excluded.relationship);

update public.family_members
set self_managed_by_user_id = coalesce(self_managed_by_user_id, linked_user_id, profile_id)
where access_stage = 'adult_18_plus'
  and coalesce(linked_user_id, profile_id) is not null;

create or replace function public.current_user_owns_family(target_family_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.families
    where families.id = target_family_id
      and families.owner_id = (select auth.uid())
  )
  or exists (
    select 1
    from public.family_memberships
    where family_memberships.family_id = target_family_id
      and family_memberships.user_id = (select auth.uid())
      and family_memberships.role = 'owner'
  );
$$;

create or replace function public.current_user_is_family_admin(target_family_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.family_memberships
    where family_memberships.family_id = target_family_id
      and family_memberships.user_id = (select auth.uid())
      and family_memberships.role in ('owner', 'admin')
  )
  or exists (
    select 1
    from public.families
    where families.id = target_family_id
      and families.owner_id = (select auth.uid())
  );
$$;

create or replace function public.current_user_is_family_member(target_family_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.family_memberships
    where family_memberships.family_id = target_family_id
      and family_memberships.user_id = (select auth.uid())
      and family_memberships.role in ('owner', 'admin', 'member')
  )
  or exists (
    select 1
    from public.families
    where families.id = target_family_id
      and families.owner_id = (select auth.uid())
  );
$$;

create or replace function public.current_user_belongs_to_family(target_family_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select public.current_user_is_family_member(target_family_id);
$$;

create or replace function public.current_user_can_manage_family(target_family_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select public.current_user_is_family_admin(target_family_id);
$$;

create or replace function public.current_user_has_assigned_care_access(target_family_member_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.caregiver_child_access access
    left join public.caregiver_profiles caregiver
      on caregiver.id = access.caregiver_profile_id
    left join public.children child
      on child.id = access.child_id
    where (
        access.child_id = target_family_member_id
        or child.family_member_id = target_family_member_id
      )
      and coalesce(access.is_active, access.status = 'active', false)
      and coalesce(access.caregiver_user_id, caregiver.user_id, caregiver.profile_id) = (select auth.uid())
      and (access.starts_at is null or access.starts_at <= timezone('utc', now()))
      and (access.ends_at is null or access.ends_at >= timezone('utc', now()))
  );
$$;

create or replace function public.current_user_can_view_care_profile(target_family_member_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.family_members member
    where member.id = target_family_member_id
      and (
        member.self_managed_by_user_id = (select auth.uid())
        or member.linked_user_id = (select auth.uid())
        or member.profile_id = (select auth.uid())
        or public.current_user_has_assigned_care_access(member.id)
        or (
          public.current_user_is_family_member(member.family_id)
          and (
            member.access_stage in ('child_0_12', 'teen_13_17')
            or member.adult_private = false
          )
        )
        or exists (
          select 1
          from public.sharing_permissions permission
          where permission.family_id = member.family_id
            and (
              permission.family_member_id = member.id
              or permission.owner_profile_id = member.self_managed_by_user_id
              or permission.owner_profile_id = member.linked_user_id
              or permission.owner_profile_id = member.profile_id
            )
            and coalesce(permission.can_view, true)
            and (permission.expires_at is null or permission.expires_at > timezone('utc', now()))
            and (
              permission.grantee_user_id = (select auth.uid())
              or permission.target_profile_id = (select auth.uid())
            )
        )
      )
  );
$$;

create or replace function private.user_has_family_access(target_family_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select public.current_user_is_family_member(target_family_id);
$$;

create or replace function private.user_can_admin_family(target_family_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select public.current_user_is_family_admin(target_family_id);
$$;

create or replace function private.user_has_child_caregiver_access(target_child_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select public.current_user_has_assigned_care_access(target_child_id);
$$;

revoke all on function public.current_user_owns_family(uuid) from public;
revoke all on function public.current_user_is_family_admin(uuid) from public;
revoke all on function public.current_user_is_family_member(uuid) from public;
revoke all on function public.current_user_belongs_to_family(uuid) from public;
revoke all on function public.current_user_can_manage_family(uuid) from public;
revoke all on function public.current_user_has_assigned_care_access(uuid) from public;
revoke all on function public.current_user_can_view_care_profile(uuid) from public;
revoke execute on function private.user_has_family_access(uuid) from public, anon, authenticated, service_role;
revoke execute on function private.user_can_admin_family(uuid) from public, anon, authenticated, service_role;
revoke execute on function private.user_has_child_caregiver_access(uuid) from public, anon, authenticated, service_role;

grant execute on function public.current_user_owns_family(uuid) to authenticated;
grant execute on function public.current_user_is_family_admin(uuid) to authenticated;
grant execute on function public.current_user_is_family_member(uuid) to authenticated;
grant execute on function public.current_user_belongs_to_family(uuid) to authenticated;
grant execute on function public.current_user_can_manage_family(uuid) to authenticated;
grant execute on function public.current_user_has_assigned_care_access(uuid) to authenticated;
grant execute on function public.current_user_can_view_care_profile(uuid) to authenticated;
grant execute on function private.user_has_child_caregiver_access(uuid) to authenticated;

drop policy if exists "Users can read accessible memberships" on public.family_memberships;
drop policy if exists "Admins can manage memberships" on public.family_memberships;
drop policy if exists "Admins can insert memberships" on public.family_memberships;
drop policy if exists "Admins can update memberships" on public.family_memberships;
drop policy if exists "Admins can delete memberships" on public.family_memberships;
drop policy if exists "Owners can insert own initial membership" on public.family_memberships;

create policy "Users can read own and administered memberships" on public.family_memberships for select
to authenticated using (
  user_id = (select auth.uid())
  or public.current_user_is_family_admin(family_id)
);

create policy "Admins can insert family memberships" on public.family_memberships for insert
to authenticated with check (
  public.current_user_is_family_admin(family_id)
  or (
    user_id = (select auth.uid())
    and role = 'owner'
    and public.current_user_owns_family(family_id)
  )
);

create policy "Admins can update family memberships" on public.family_memberships for update
to authenticated using (public.current_user_is_family_admin(family_id))
with check (public.current_user_is_family_admin(family_id));

create policy "Admins can delete family memberships" on public.family_memberships for delete
to authenticated using (
  public.current_user_is_family_admin(family_id)
  and user_id <> (select auth.uid())
);

drop policy if exists "Family managers can manage families" on public.families;
drop policy if exists "Family members can read family" on public.families;
drop policy if exists "Users can read accessible families" on public.families;
drop policy if exists "Admins can update families" on public.families;

create policy "Family admins can manage families" on public.families for all
to authenticated using (public.current_user_is_family_admin(id))
with check (owner_id = (select auth.uid()) or public.current_user_is_family_admin(id));

create policy "Family members can read non-caregiver families" on public.families for select
to authenticated using (public.current_user_is_family_member(id));

drop policy if exists "Family users can read family members" on public.family_members;
drop policy if exists "Family managers can manage family members" on public.family_members;
drop policy if exists "Users can read accessible family members" on public.family_members;
drop policy if exists "Users can manage accessible family members" on public.family_members;

create policy "Users can read visible care profiles" on public.family_members for select
to authenticated using (public.current_user_can_view_care_profile(id));

create policy "Family admins can manage care profiles" on public.family_members for all
to authenticated using (public.current_user_is_family_admin(family_id))
with check (public.current_user_is_family_admin(family_id));

drop policy if exists "Family users can manage children" on public.children;
drop policy if exists "Family users can read children" on public.children;
drop policy if exists "Family managers can manage children" on public.children;
drop policy if exists "Caregivers can read assigned children" on public.children;

create policy "Family members can read visible children" on public.children for select
to authenticated using (
  public.current_user_is_family_member(family_id)
  or public.current_user_has_assigned_care_access(coalesce(family_member_id, id))
);

create policy "Family admins can manage children" on public.children for all
to authenticated using (public.current_user_is_family_admin(family_id))
with check (public.current_user_is_family_admin(family_id));

create policy "Caregivers can read assigned children" on public.children for select
to authenticated using (public.current_user_has_assigned_care_access(coalesce(family_member_id, id)));

drop policy if exists "Family admins can manage caregiver access" on public.caregiver_child_access;
create policy "Family admins can manage caregiver access" on public.caregiver_child_access for all
to authenticated using (public.current_user_is_family_admin(family_id))
with check (
  public.current_user_is_family_admin(family_id)
  and coalesce(granted_by_user_id, granted_by) = (select auth.uid())
);

drop policy if exists "Family users can manage sharing permissions" on public.sharing_permissions;
drop policy if exists "Grantees can read sharing permissions" on public.sharing_permissions;
drop policy if exists "Users can manage sharing permissions they own" on public.sharing_permissions;
drop policy if exists "Targets can read sharing permissions" on public.sharing_permissions;
drop policy if exists "Users can read own sharing permissions" on public.sharing_permissions;
drop policy if exists "Admins and creators can insert sharing permissions" on public.sharing_permissions;
drop policy if exists "Admins and creators can update sharing permissions" on public.sharing_permissions;
drop policy if exists "Admins and creators can delete sharing permissions" on public.sharing_permissions;

create policy "Users can read relevant sharing permissions" on public.sharing_permissions for select
to authenticated using (
  grantee_user_id = (select auth.uid())
  or target_profile_id = (select auth.uid())
  or owner_profile_id = (select auth.uid())
  or created_by_user_id = (select auth.uid())
  or public.current_user_is_family_admin(family_id)
);

create policy "Users can create own sharing permissions" on public.sharing_permissions for insert
to authenticated with check (
  created_by_user_id = (select auth.uid())
  and (
    owner_profile_id = (select auth.uid())
    or public.current_user_is_family_admin(family_id)
  )
);

create policy "Users can update own sharing permissions" on public.sharing_permissions for update
to authenticated using (
  owner_profile_id = (select auth.uid())
  or created_by_user_id = (select auth.uid())
  or public.current_user_is_family_admin(family_id)
)
with check (
  created_by_user_id = (select auth.uid())
  or owner_profile_id = (select auth.uid())
  or public.current_user_is_family_admin(family_id)
);

create policy "Users can delete own sharing permissions" on public.sharing_permissions for delete
to authenticated using (
  owner_profile_id = (select auth.uid())
  or created_by_user_id = (select auth.uid())
  or public.current_user_is_family_admin(family_id)
);

-- RLS verification cases for local Supabase tests:
-- 1. A user may hold memberships in multiple families with different relationship values.
-- 2. owner/admin can manage memberships and invites; member cannot.
-- 3. caregiver memberships do not satisfy current_user_is_family_member.
-- 4. caregivers only see care profiles/children through caregiver_child_access.
-- 5. adult_private adult profiles require self access or explicit sharing_permissions.
-- 6. child_0_12 and teen_13_17 profiles remain visible to non-caregiver family members for now.
