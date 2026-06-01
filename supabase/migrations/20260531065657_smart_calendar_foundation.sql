do $$ begin
  create type public.calendar_type as enum (
    'personal',
    'family',
    'child',
    'medical',
    'school_sport',
    'caregiver',
    'baby_routine'
  );
exception when duplicate_object then null;
end $$;

create table if not exists public.calendar_events (
  id uuid primary key default gen_random_uuid(),
  family_id uuid references public.families(id),
  profile_id uuid references public.profiles(id),
  child_id uuid references public.children(id),
  created_by uuid references public.profiles(id),
  calendar_type public.calendar_type not null,
  title text not null,
  description text,
  location text,
  start_time timestamptz not null,
  end_time timestamptz,
  privacy_level public.privacy_level default 'private',
  is_sensitive boolean default false,
  requires_approval boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.calendar_events
  add column if not exists family_id uuid references public.families(id),
  add column if not exists profile_id uuid references public.profiles(id),
  add column if not exists child_id uuid references public.children(id),
  add column if not exists created_by uuid references public.profiles(id),
  add column if not exists calendar_type public.calendar_type,
  add column if not exists title text,
  add column if not exists description text,
  add column if not exists location text,
  add column if not exists start_time timestamptz,
  add column if not exists end_time timestamptz,
  add column if not exists privacy_level public.privacy_level default 'private',
  add column if not exists is_sensitive boolean default false,
  add column if not exists requires_approval boolean default false,
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

create table if not exists public.event_responses (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references public.calendar_events(id) on delete cascade,
  profile_id uuid references public.profiles(id) on delete cascade,
  response text check (response in ('pending', 'approved', 'declined', 'postponed')),
  note text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(event_id, profile_id)
);

alter table public.event_responses
  add column if not exists event_id uuid references public.calendar_events(id) on delete cascade,
  add column if not exists profile_id uuid references public.profiles(id) on delete cascade,
  add column if not exists response text,
  add column if not exists note text,
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

do $$ begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'event_responses_response_check'
      and conrelid = 'public.event_responses'::regclass
  ) then
    alter table public.event_responses
      add constraint event_responses_response_check
      check (response in ('pending', 'approved', 'declined', 'postponed'));
  end if;
end $$;

do $$ begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'event_responses_event_profile_key'
      and conrelid = 'public.event_responses'::regclass
  ) then
    alter table public.event_responses
      add constraint event_responses_event_profile_key unique (event_id, profile_id);
  end if;
end $$;

alter table public.calendar_events enable row level security;
alter table public.event_responses enable row level security;

grant select, insert, update, delete on
  public.calendar_events,
  public.event_responses
to authenticated;

create index if not exists calendar_events_family_start_idx on public.calendar_events(family_id, start_time);
create index if not exists calendar_events_profile_start_idx on public.calendar_events(profile_id, start_time);
create index if not exists calendar_events_child_start_idx on public.calendar_events(child_id, start_time);
create index if not exists event_responses_event_id_idx on public.event_responses(event_id);

drop trigger if exists calendar_events_set_updated_at on public.calendar_events;
create trigger calendar_events_set_updated_at
before update on public.calendar_events
for each row execute function public.set_updated_at();

drop trigger if exists event_responses_set_updated_at on public.event_responses;
create trigger event_responses_set_updated_at
before update on public.event_responses
for each row execute function public.set_updated_at();

drop policy if exists "Users can read visible calendar events" on public.calendar_events;
create policy "Users can read visible calendar events" on public.calendar_events for select
to authenticated using (
  created_by = (select auth.uid())
  or profile_id = (select auth.uid())
  or (
    privacy_level in ('family_shared', 'partner_shared', 'caregiver_shared', 'emergency_only')
    and family_id is not null
    and (
      exists (
        select 1
        from public.families
        where families.id = calendar_events.family_id
          and families.owner_id = (select auth.uid())
      )
      or exists (
        select 1
        from public.family_members
        where family_members.family_id = calendar_events.family_id
          and family_members.profile_id = (select auth.uid())
      )
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

drop policy if exists "Users can create routed calendar events" on public.calendar_events;
create policy "Users can create routed calendar events" on public.calendar_events for insert
to authenticated with check (
  created_by = (select auth.uid())
  and (
    profile_id = (select auth.uid())
    or (
      family_id is not null
      and (
        exists (
          select 1
          from public.families
          where families.id = calendar_events.family_id
            and families.owner_id = (select auth.uid())
        )
        or exists (
          select 1
          from public.family_members manager
          where manager.family_id = calendar_events.family_id
            and manager.profile_id = (select auth.uid())
            and manager.can_manage_family
        )
      )
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

drop policy if exists "Creators and family managers can update calendar events" on public.calendar_events;
create policy "Creators and family managers can update calendar events" on public.calendar_events for update
to authenticated using (
  created_by = (select auth.uid())
  or (
    family_id is not null
    and exists (
      select 1
      from public.family_members manager
      where manager.family_id = calendar_events.family_id
        and manager.profile_id = (select auth.uid())
        and manager.can_manage_family
    )
  )
)
with check (
  created_by = (select auth.uid())
  or (
    family_id is not null
    and exists (
      select 1
      from public.family_members manager
      where manager.family_id = calendar_events.family_id
        and manager.profile_id = (select auth.uid())
        and manager.can_manage_family
    )
  )
);

drop policy if exists "Users can read visible event responses" on public.event_responses;
create policy "Users can read visible event responses" on public.event_responses for select
to authenticated using (
  profile_id = (select auth.uid())
  or exists (
    select 1
    from public.calendar_events
    where calendar_events.id = event_responses.event_id
  )
);

drop policy if exists "Users can upsert own event responses" on public.event_responses;
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
