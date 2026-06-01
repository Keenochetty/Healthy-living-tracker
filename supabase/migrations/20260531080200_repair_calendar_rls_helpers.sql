drop policy if exists "Users can read visible calendar events" on public.calendar_events;
drop policy if exists "Users can create routed calendar events" on public.calendar_events;
drop policy if exists "Creators and family managers can update calendar events" on public.calendar_events;
drop policy if exists "Users can read visible event responses" on public.event_responses;
drop policy if exists "Users can upsert own event responses" on public.event_responses;

create policy "Users can read visible calendar events" on public.calendar_events for select
to authenticated using (
  created_by = (select auth.uid())
  or profile_id = (select auth.uid())
  or (
    privacy_level in ('family_shared', 'partner_shared', 'caregiver_shared', 'emergency_only')
    and family_id is not null
    and (
      public.current_user_owns_family(family_id)
      or public.current_user_belongs_to_family(family_id)
    )
  )
  or (
    privacy_level = 'partner_shared'
    and exists (
      select 1
      from public.sharing_permissions
      where sharing_permissions.owner_profile_id = calendar_events.profile_id
        and sharing_permissions.target_profile_id = (select auth.uid())
        and sharing_permissions.privacy_level = 'partner_shared'
        and sharing_permissions.resource_type = 'calendar'
        and sharing_permissions.can_view
    )
  )
  or (
    privacy_level in ('caregiver_shared', 'emergency_only')
    and child_id is not null
    and exists (
      select 1
      from public.caregiver_child_access access
      join public.caregiver_profiles caregiver
        on caregiver.id = access.caregiver_profile_id
      where access.child_id = calendar_events.child_id
        and access.is_active
        and access.can_view_schedule
        and caregiver.profile_id = (select auth.uid())
    )
  )
);

create policy "Users can create routed calendar events" on public.calendar_events for insert
to authenticated with check (
  created_by = (select auth.uid())
  and (
    profile_id = (select auth.uid())
    or (
      family_id is not null
      and public.current_user_can_manage_family(family_id)
    )
    or (
      child_id is not null
      and exists (
        select 1
        from public.caregiver_child_access access
        join public.caregiver_profiles caregiver
          on caregiver.id = access.caregiver_profile_id
        where access.child_id = calendar_events.child_id
          and access.is_active
          and access.can_view_schedule
          and caregiver.profile_id = (select auth.uid())
      )
    )
  )
);

create policy "Creators and family managers can update calendar events" on public.calendar_events for update
to authenticated using (
  created_by = (select auth.uid())
  or (
    family_id is not null
    and public.current_user_can_manage_family(family_id)
  )
)
with check (
  created_by = (select auth.uid())
  or (
    family_id is not null
    and public.current_user_can_manage_family(family_id)
  )
);

create policy "Users can read visible event responses" on public.event_responses for select
to authenticated using (
  profile_id = (select auth.uid())
  or exists (
    select 1
    from public.calendar_events
    where calendar_events.id = event_responses.event_id
  )
);

create policy "Users can upsert own event responses" on public.event_responses for all
to authenticated using (profile_id = (select auth.uid()))
with check (
  profile_id = (select auth.uid())
  and exists (
    select 1
    from public.calendar_events
    where calendar_events.id = event_responses.event_id
  )
);
