do $$ begin
  create type public.activity_type as enum (
    'feed',
    'nap',
    'medication',
    'bathroom',
    'mood',
    'activity',
    'incident',
    'photo_update',
    'note',
    'emergency'
  );
exception when duplicate_object then null;
end $$;

create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  child_id uuid references public.children(id) on delete cascade,
  family_id uuid references public.families(id) on delete cascade,
  created_by uuid references public.profiles(id),
  activity_type public.activity_type not null,
  title text not null,
  note text,
  privacy_level public.privacy_level default 'family_shared',
  notification_type public.notification_type default 'green_normal_update',
  is_shared_with_parents boolean default true,
  is_shared_with_caregiver boolean default false,
  created_at timestamptz default now()
);

create table if not exists public.activity_photos (
  id uuid primary key default gen_random_uuid(),
  activity_log_id uuid references public.activity_logs(id) on delete cascade,
  uploaded_by uuid references public.profiles(id),
  storage_path text not null,
  created_at timestamptz default now()
);

alter table public.activity_logs add column if not exists child_id uuid references public.children(id) on delete cascade;
alter table public.activity_logs add column if not exists family_id uuid references public.families(id) on delete cascade;
alter table public.activity_logs add column if not exists created_by uuid references public.profiles(id);
alter table public.activity_logs add column if not exists activity_type public.activity_type;
alter table public.activity_logs add column if not exists title text;
alter table public.activity_logs add column if not exists note text;
alter table public.activity_logs add column if not exists privacy_level public.privacy_level default 'family_shared';
alter table public.activity_logs add column if not exists notification_type public.notification_type default 'green_normal_update';
alter table public.activity_logs add column if not exists is_shared_with_parents boolean default true;
alter table public.activity_logs add column if not exists is_shared_with_caregiver boolean default false;
alter table public.activity_logs add column if not exists created_at timestamptz default now();

alter table public.activity_photos add column if not exists activity_log_id uuid references public.activity_logs(id) on delete cascade;
alter table public.activity_photos add column if not exists uploaded_by uuid references public.profiles(id);
alter table public.activity_photos add column if not exists storage_path text;
alter table public.activity_photos add column if not exists created_at timestamptz default now();

alter table public.activity_logs enable row level security;
alter table public.activity_photos enable row level security;

grant select, insert, update, delete on
  public.activity_logs,
  public.activity_photos
to authenticated;

create index if not exists activity_logs_child_created_idx on public.activity_logs(child_id, created_at desc);
create index if not exists activity_logs_family_created_idx on public.activity_logs(family_id, created_at desc);
create index if not exists activity_photos_log_idx on public.activity_photos(activity_log_id);

drop policy if exists "Family users can read activity logs" on public.activity_logs;
create policy "Family users can read activity logs" on public.activity_logs for select
to authenticated using (
  exists (
    select 1
    from public.family_members
    where family_members.family_id = activity_logs.family_id
      and family_members.profile_id = (select auth.uid())
  )
  or exists (
    select 1
    from public.families
    where families.id = activity_logs.family_id
      and families.owner_id = (select auth.uid())
  )
  or exists (
    select 1
    from public.caregiver_child_access access
    join public.caregiver_profiles caregiver
      on caregiver.id = access.caregiver_profile_id
    where access.child_id = activity_logs.child_id
      and access.is_active
      and activity_logs.is_shared_with_caregiver
      and caregiver.profile_id = (select auth.uid())
  )
);

drop policy if exists "Parents and assigned caregivers can create activity logs" on public.activity_logs;
create policy "Parents and assigned caregivers can create activity logs" on public.activity_logs for insert
to authenticated with check (
  created_by = (select auth.uid())
  and exists (
    select 1
    from public.children
    where children.id = activity_logs.child_id
      and children.family_id = activity_logs.family_id
  )
  and (
    exists (
      select 1
      from public.families
      join public.profiles
        on profiles.id = families.owner_id
      where families.id = activity_logs.family_id
        and families.owner_id = (select auth.uid())
        and (
          profiles.primary_role = 'parent_guardian'
          or profiles.app_role = 'parent_guardian'
        )
    )
    or exists (
      select 1
      from public.family_members manager
      where manager.family_id = activity_logs.family_id
        and manager.profile_id = (select auth.uid())
        and manager.role = 'parent_guardian'
        and manager.can_manage_family
    )
    or exists (
      select 1
      from public.caregiver_child_access access
      join public.caregiver_profiles caregiver
        on caregiver.id = access.caregiver_profile_id
      where access.child_id = activity_logs.child_id
        and access.family_id = activity_logs.family_id
        and access.is_active
        and access.can_log_activity
        and caregiver.profile_id = (select auth.uid())
    )
  )
);

drop policy if exists "Activity creators and family managers can update logs" on public.activity_logs;
create policy "Activity creators and family managers can update logs" on public.activity_logs for update
to authenticated using (
  created_by = (select auth.uid())
  or exists (
    select 1
    from public.families
    join public.profiles
      on profiles.id = families.owner_id
    where families.id = activity_logs.family_id
      and families.owner_id = (select auth.uid())
      and (
        profiles.primary_role = 'parent_guardian'
        or profiles.app_role = 'parent_guardian'
      )
  )
  or exists (
    select 1
    from public.family_members manager
    where manager.family_id = activity_logs.family_id
      and manager.profile_id = (select auth.uid())
      and manager.role = 'parent_guardian'
      and manager.can_manage_family
  )
)
with check (
  created_by = (select auth.uid())
  and exists (
    select 1
    from public.children
    where children.id = activity_logs.child_id
      and children.family_id = activity_logs.family_id
  )
  and (
    exists (
      select 1
      from public.families
      join public.profiles
        on profiles.id = families.owner_id
      where families.id = activity_logs.family_id
        and families.owner_id = (select auth.uid())
        and (
          profiles.primary_role = 'parent_guardian'
          or profiles.app_role = 'parent_guardian'
        )
    )
    or exists (
      select 1
      from public.family_members manager
      where manager.family_id = activity_logs.family_id
        and manager.profile_id = (select auth.uid())
        and manager.role = 'parent_guardian'
        and manager.can_manage_family
    )
    or exists (
      select 1
      from public.caregiver_child_access access
      join public.caregiver_profiles caregiver
        on caregiver.id = access.caregiver_profile_id
      where access.child_id = activity_logs.child_id
        and access.family_id = activity_logs.family_id
        and access.is_active
        and access.can_log_activity
        and caregiver.profile_id = (select auth.uid())
    )
  )
);

drop policy if exists "Users can read activity photos with visible logs" on public.activity_photos;
create policy "Users can read activity photos with visible logs" on public.activity_photos for select
to authenticated using (
  exists (
    select 1
    from public.activity_logs
    where activity_logs.id = activity_photos.activity_log_id
  )
);

drop policy if exists "Users can create photos for visible logs" on public.activity_photos;
create policy "Users can create photos for visible logs" on public.activity_photos for insert
to authenticated with check (
  uploaded_by = (select auth.uid())
  and exists (
    select 1
    from public.activity_logs
    where activity_logs.id = activity_photos.activity_log_id
  )
);

create or replace function public.notify_activity_log_recipients()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  creator_is_caregiver boolean;
  notification_title text;
  notification_preview text;
begin
  notification_title := coalesce(nullif(new.title, ''), 'Activity update');
  notification_preview := case
    when new.activity_type = 'emergency' then 'Emergency activity update'
    when new.activity_type = 'incident' then 'Incident activity update'
    else 'New activity update'
  end;

  select exists (
    select 1
    from public.caregiver_child_access access
    join public.caregiver_profiles caregiver
      on caregiver.id = access.caregiver_profile_id
    where access.child_id = new.child_id
      and access.family_id = new.family_id
      and access.is_active
      and caregiver.profile_id = new.created_by
  )
  into creator_is_caregiver;

  if creator_is_caregiver and new.is_shared_with_parents then
    insert into public.notifications (
      recipient_profile_id,
      sender_profile_id,
      family_id,
      child_id,
      type,
      title,
      safe_preview,
      full_message,
      is_sensitive,
      requires_action
    )
    select distinct recipient_id, new.created_by, new.family_id, new.child_id, new.notification_type,
      notification_title, notification_preview, new.note, new.privacy_level <> 'family_shared', false
    from (
      select families.owner_id as recipient_id
      from public.families
      where families.id = new.family_id
      union
      select family_members.profile_id as recipient_id
      from public.family_members
      where family_members.family_id = new.family_id
        and family_members.role = 'parent_guardian'
    ) recipients
    where recipient_id is not null
      and recipient_id <> new.created_by;
  elsif not creator_is_caregiver and new.is_shared_with_caregiver then
    insert into public.notifications (
      recipient_profile_id,
      sender_profile_id,
      family_id,
      child_id,
      type,
      title,
      safe_preview,
      full_message,
      is_sensitive,
      requires_action
    )
    select distinct caregiver.profile_id, new.created_by, new.family_id, new.child_id, new.notification_type,
      notification_title, notification_preview, new.note, new.privacy_level <> 'family_shared', false
    from public.caregiver_child_access access
    join public.caregiver_profiles caregiver
      on caregiver.id = access.caregiver_profile_id
    where access.child_id = new.child_id
      and access.family_id = new.family_id
      and access.is_active
      and caregiver.profile_id <> new.created_by;
  end if;

  return new;
end;
$$;

revoke all on function public.notify_activity_log_recipients() from public;

drop trigger if exists notify_activity_log_recipients on public.activity_logs;
create trigger notify_activity_log_recipients
after insert on public.activity_logs
for each row execute function public.notify_activity_log_recipients();
