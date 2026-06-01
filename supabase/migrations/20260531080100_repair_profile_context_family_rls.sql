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
  );
$$;

create or replace function public.current_user_belongs_to_family(target_family_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.family_members
    where family_members.family_id = target_family_id
      and family_members.profile_id = (select auth.uid())
  );
$$;

create or replace function public.current_user_can_manage_family(target_family_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select
    public.current_user_owns_family(target_family_id)
    or exists (
      select 1
      from public.family_members
      where family_members.family_id = target_family_id
        and family_members.profile_id = (select auth.uid())
        and family_members.can_manage_family
    );
$$;

revoke all on function public.current_user_owns_family(uuid) from public;
revoke all on function public.current_user_belongs_to_family(uuid) from public;
revoke all on function public.current_user_can_manage_family(uuid) from public;

grant execute on function public.current_user_owns_family(uuid) to authenticated;
grant execute on function public.current_user_belongs_to_family(uuid) to authenticated;
grant execute on function public.current_user_can_manage_family(uuid) to authenticated;

drop policy if exists "Family managers can manage families" on public.families;
drop policy if exists "Family members can read family" on public.families;
drop policy if exists "Family users can read family members" on public.family_members;
drop policy if exists "Family managers can manage family members" on public.family_members;

create policy "Family managers can manage families" on public.families for all
to authenticated using (public.current_user_owns_family(id))
with check (owner_id = (select auth.uid()));

create policy "Family members can read family" on public.families for select
to authenticated using (
  public.current_user_owns_family(id)
  or public.current_user_belongs_to_family(id)
);

create policy "Family users can read family members" on public.family_members for select
to authenticated using (
  profile_id = (select auth.uid())
  or public.current_user_owns_family(family_id)
  or public.current_user_belongs_to_family(family_id)
);

create policy "Family managers can manage family members" on public.family_members for all
to authenticated using (public.current_user_can_manage_family(family_id))
with check (public.current_user_can_manage_family(family_id));
