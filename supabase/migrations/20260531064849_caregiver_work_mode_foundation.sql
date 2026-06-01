alter table public.profiles
  add column if not exists email text;

create index if not exists profiles_email_lower_idx on public.profiles(lower(email));

drop policy if exists "Caregivers can read assigned children" on public.children;
create policy "Caregivers can read assigned children" on public.children for select
to authenticated using (
  exists (
    select 1
    from public.caregiver_child_access access
    join public.caregiver_profiles caregiver
      on caregiver.id = access.caregiver_profile_id
    where access.child_id = children.id
      and access.is_active
      and caregiver.profile_id = (select auth.uid())
  )
);

create or replace function public.grant_caregiver_child_access(
  caregiver_email text,
  target_child_id uuid,
  allow_view_care_instructions boolean default true,
  allow_view_schedule boolean default true,
  allow_log_activity boolean default true,
  allow_upload_photos boolean default false,
  allow_use_emergency_button boolean default true
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  target_caregiver_profile_id uuid;
  target_family_id uuid;
  access_id uuid;
begin
  if (select auth.uid()) is null then
    raise exception 'Authentication required';
  end if;

  select children.family_id
    into target_family_id
  from public.children
  where children.id = target_child_id;

  if target_family_id is null then
    raise exception 'Child profile not found';
  end if;

  if not exists (
    select 1
    from public.families
    where families.id = target_family_id
      and families.owner_id = (select auth.uid())
  ) and not exists (
    select 1
    from public.family_members manager
    where manager.family_id = target_family_id
      and manager.profile_id = (select auth.uid())
      and manager.can_manage_family
      and manager.role = 'parent_guardian'
  ) then
    raise exception 'Only parents or guardians with family permission can grant caregiver access';
  end if;

  select caregiver_profiles.id
    into target_caregiver_profile_id
  from public.profiles
  join public.caregiver_profiles
    on caregiver_profiles.profile_id = profiles.id
  where lower(profiles.email) = lower(btrim(caregiver_email))
  limit 1;

  if target_caregiver_profile_id is null then
    raise exception 'No caregiver work profile found for that email';
  end if;

  insert into public.caregiver_child_access (
    caregiver_profile_id,
    child_id,
    family_id,
    granted_by,
    can_view_care_instructions,
    can_view_schedule,
    can_log_activity,
    can_upload_photos,
    can_use_emergency_button,
    is_active
  )
  values (
    target_caregiver_profile_id,
    target_child_id,
    target_family_id,
    (select auth.uid()),
    allow_view_care_instructions,
    allow_view_schedule,
    allow_log_activity,
    allow_upload_photos,
    allow_use_emergency_button,
    true
  )
  on conflict (caregiver_profile_id, child_id)
  do update set
    family_id = excluded.family_id,
    granted_by = excluded.granted_by,
    can_view_care_instructions = excluded.can_view_care_instructions,
    can_view_schedule = excluded.can_view_schedule,
    can_log_activity = excluded.can_log_activity,
    can_upload_photos = excluded.can_upload_photos,
    can_use_emergency_button = excluded.can_use_emergency_button,
    is_active = true
  returning id into access_id;

  return access_id;
end;
$$;

revoke all on function public.grant_caregiver_child_access(
  text,
  uuid,
  boolean,
  boolean,
  boolean,
  boolean,
  boolean
) from public;

grant execute on function public.grant_caregiver_child_access(
  text,
  uuid,
  boolean,
  boolean,
  boolean,
  boolean,
  boolean
) to authenticated;
