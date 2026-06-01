grant usage on schema private to authenticated;

grant execute on function private.user_has_family_access(uuid) to authenticated;
grant execute on function private.user_can_admin_family(uuid) to authenticated;

drop policy if exists "Owners can insert own initial membership" on public.family_memberships;
create policy "Owners can insert own initial membership"
  on public.family_memberships
  for insert
  to authenticated
  with check (
    user_id = (select auth.uid())
    and role = 'owner'
    and exists (
      select 1
      from public.families f
      where f.id = family_id
        and f.owner_id = (select auth.uid())
    )
  );

notify pgrst, 'reload schema';
