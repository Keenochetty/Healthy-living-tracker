alter type public.family_member_profile_type add value if not exists 'parent_guardian';
alter type public.family_member_profile_type add value if not exists 'woman';
alter type public.family_member_profile_type add value if not exists 'man';
alter type public.family_member_profile_type add value if not exists 'elderly_dependent';

do $$
declare
  constraint_name text;
begin
  for constraint_name in
    select conname
    from pg_constraint
    where conrelid = 'public.profiles'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) like '%app_role%'
  loop
    execute format('alter table public.profiles drop constraint %I', constraint_name);
  end loop;
end $$;

alter table public.profiles
  add column if not exists phone text,
  add column if not exists personal_family_member_id uuid references public.family_members(id) on delete set null,
  add column if not exists linked_partner_family_member_id uuid references public.family_members(id) on delete set null,
  alter column app_role set default 'parent_guardian';

alter table public.profiles
  add constraint profiles_app_role_check
  check (app_role in ('parent_guardian', 'caregiver', 'woman', 'man', 'child', 'baby', 'elderly_dependent'));

alter table public.family_members
  add column if not exists linked_user_id uuid references auth.users(id) on delete set null;

create unique index if not exists family_members_linked_user_id_idx
  on public.family_members(linked_user_id)
  where linked_user_id is not null;

create index if not exists family_members_managed_by_user_id_idx on public.family_members(managed_by_user_id);
create index if not exists profiles_personal_family_member_id_idx on public.profiles(personal_family_member_id);
create index if not exists profiles_linked_partner_family_member_id_idx on public.profiles(linked_partner_family_member_id);
create index if not exists profiles_phone_idx on public.profiles(phone);

create or replace function public.handle_new_user()
returns trigger
set search_path = pg_catalog, public
language plpgsql
security definer
as $$
declare
  desired_role text := coalesce(nullif(new.raw_user_meta_data->>'app_role', ''), 'parent_guardian');
  desired_profile_type public.family_member_profile_type;
  family_setup text := coalesce(nullif(new.raw_user_meta_data->>'family_setup', ''), 'create');
  family_join_code text := nullif(btrim(new.raw_user_meta_data->>'family_join_code'), '');
  family_display_name text := nullif(btrim(new.raw_user_meta_data->>'family_name'), '');
  full_name text := coalesce(nullif(btrim(new.raw_user_meta_data->>'full_name'), ''), split_part(coalesce(new.email, new.phone, 'New account'), '@', 1));
  invite_record public.family_invites%rowtype;
  target_family_id uuid;
  personal_member_id uuid;
begin
  if desired_role not in ('parent_guardian', 'caregiver', 'woman', 'man', 'child', 'baby', 'elderly_dependent') then
    desired_role := 'parent_guardian';
  end if;

  begin
    desired_profile_type := coalesce(nullif(new.raw_user_meta_data->>'profile_type', ''), desired_role)::public.family_member_profile_type;
  exception when invalid_text_representation then
    desired_profile_type := desired_role::public.family_member_profile_type;
  end;

  insert into public.profiles (id, email, phone, full_name, app_role)
  values (new.id, new.email, coalesce(new.phone, new.raw_user_meta_data->>'phone'), full_name, desired_role)
  on conflict (id) do update set
    email = excluded.email,
    phone = coalesce(public.profiles.phone, excluded.phone),
    full_name = coalesce(public.profiles.full_name, excluded.full_name),
    app_role = excluded.app_role;

  if family_setup = 'join' then
    if family_join_code is null then
      raise exception 'Family join code is required.';
    end if;

    select *
    into invite_record
    from public.family_invites
    where token = family_join_code
      and status = 'pending'
      and (expires_at is null or expires_at > timezone('utc', now()))
      and (new.email is null or lower(invited_email) = lower(new.email))
    limit 1;

    if invite_record.id is null then
      raise exception 'Invalid or expired family join code.';
    end if;

    target_family_id := invite_record.family_id;

    insert into public.family_memberships (family_id, user_id, role)
    values (target_family_id, new.id, invite_record.role)
    on conflict (family_id, user_id) do update set role = excluded.role;

    update public.family_invites
    set status = 'accepted',
        accepted_by_user_id = new.id
    where id = invite_record.id;
  else
    insert into public.families (owner_id, name)
    values (new.id, coalesce(family_display_name, full_name || ' Family'))
    returning id into target_family_id;

    insert into public.family_memberships (family_id, user_id, role)
    values (target_family_id, new.id, 'owner')
    on conflict do nothing;

    insert into public.subscriptions (family_id, user_id, plan, status)
    values (target_family_id, new.id, 'free', 'active')
    on conflict do nothing;
  end if;

  insert into public.family_members (
    family_id,
    name,
    relationship,
    profile_type,
    managed_by_user_id,
    linked_user_id
  )
  values (
    target_family_id,
    full_name,
    case desired_role
      when 'parent_guardian' then 'Parent / Guardian'
      when 'elderly_dependent' then 'Elderly dependent'
      else replace(initcap(replace(desired_role, '_', ' ')), ' And ', ' and ')
    end,
    desired_profile_type,
    new.id,
    new.id
  )
  on conflict (linked_user_id) where linked_user_id is not null do update set
    family_id = excluded.family_id,
    name = excluded.name,
    relationship = excluded.relationship,
    profile_type = excluded.profile_type,
    managed_by_user_id = excluded.managed_by_user_id
  returning id into personal_member_id;

  if desired_profile_type in ('baby', 'child') then
    insert into public.children (family_id, family_member_id)
    values (target_family_id, personal_member_id)
    on conflict (family_member_id) do nothing;
  end if;

  if desired_role = 'caregiver' or desired_profile_type = 'caregiver' then
    insert into public.caregiver_profiles (user_id, display_name, phone)
    values (new.id, full_name, coalesce(new.phone, new.raw_user_meta_data->>'phone'))
    on conflict (user_id) do update set
      display_name = coalesce(public.caregiver_profiles.display_name, excluded.display_name),
      phone = coalesce(public.caregiver_profiles.phone, excluded.phone);
  end if;

  update public.profiles
  set default_family_id = target_family_id,
      personal_family_member_id = personal_member_id
  where id = new.id;

  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;
