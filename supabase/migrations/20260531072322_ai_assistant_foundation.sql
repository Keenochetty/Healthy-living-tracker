create table if not exists public.ai_chat_sessions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete cascade,
  family_id uuid references public.families(id),
  title text,
  created_at timestamptz default now()
);

alter table public.ai_chat_sessions
  add column if not exists profile_id uuid references public.profiles(id) on delete cascade,
  add column if not exists family_id uuid references public.families(id),
  add column if not exists title text,
  add column if not exists created_at timestamptz default now();

create table if not exists public.ai_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references public.ai_chat_sessions(id) on delete cascade,
  sender text check (sender in ('user', 'assistant', 'system')),
  message text not null,
  metadata jsonb default '{}',
  created_at timestamptz default now()
);

alter table public.ai_messages
  add column if not exists session_id uuid references public.ai_chat_sessions(id) on delete cascade,
  add column if not exists sender text,
  add column if not exists message text,
  add column if not exists metadata jsonb default '{}',
  add column if not exists created_at timestamptz default now();

do $$ begin
  alter type public.ai_action_status add value if not exists 'draft';
  alter type public.ai_action_status add value if not exists 'confirmed';
exception when undefined_object then null;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'ai_messages_sender_check'
      and conrelid = 'public.ai_messages'::regclass
  ) then
    alter table public.ai_messages
      add constraint ai_messages_sender_check check (sender in ('user', 'assistant', 'system'));
  end if;
end $$;

create table if not exists public.ai_actions (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references public.ai_chat_sessions(id) on delete cascade,
  profile_id uuid references public.profiles(id),
  action_type text not null,
  action_payload jsonb default '{}',
  status text check (status in ('draft', 'confirmed', 'completed', 'cancelled', 'failed')) default 'draft',
  created_at timestamptz default now()
);

alter table public.ai_actions
  add column if not exists session_id uuid references public.ai_chat_sessions(id) on delete cascade,
  add column if not exists profile_id uuid references public.profiles(id),
  add column if not exists action_type text,
  add column if not exists action_payload jsonb default '{}',
  add column if not exists status text default 'draft',
  add column if not exists created_at timestamptz default now();

do $$ begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'ai_actions_status_check'
      and conrelid = 'public.ai_actions'::regclass
  ) then
    alter table public.ai_actions
      add constraint ai_actions_status_check check (status::text in ('draft', 'confirmed', 'completed', 'cancelled', 'failed'));
  end if;
end $$;

alter table public.ai_chat_sessions enable row level security;
alter table public.ai_messages enable row level security;
alter table public.ai_actions enable row level security;

grant select, insert, update, delete on
  public.ai_chat_sessions,
  public.ai_messages,
  public.ai_actions
to authenticated;

create index if not exists ai_chat_sessions_profile_created_idx on public.ai_chat_sessions(profile_id, created_at desc);
create index if not exists ai_messages_session_created_idx on public.ai_messages(session_id, created_at);
create index if not exists ai_actions_session_created_idx on public.ai_actions(session_id, created_at desc);
create index if not exists ai_actions_profile_status_idx on public.ai_actions(profile_id, status, created_at desc);

drop policy if exists "Users can manage own ai chat sessions" on public.ai_chat_sessions;
create policy "Users can manage own ai chat sessions" on public.ai_chat_sessions for all
to authenticated using (profile_id = (select auth.uid()))
with check (profile_id = (select auth.uid()));

drop policy if exists "Users can manage messages in own ai sessions" on public.ai_messages;
create policy "Users can manage messages in own ai sessions" on public.ai_messages for all
to authenticated using (
  exists (
    select 1
    from public.ai_chat_sessions
    where ai_chat_sessions.id = ai_messages.session_id
      and ai_chat_sessions.profile_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.ai_chat_sessions
    where ai_chat_sessions.id = ai_messages.session_id
      and ai_chat_sessions.profile_id = (select auth.uid())
  )
);

drop policy if exists "Users can manage own ai actions" on public.ai_actions;
create policy "Users can manage own ai actions" on public.ai_actions for all
to authenticated using (profile_id = (select auth.uid()))
with check (profile_id = (select auth.uid()));

create or replace function public.audit_ai_action_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  action_family_id uuid;
begin
  select family_id
    into action_family_id
  from public.ai_chat_sessions
  where id = new.session_id;

  insert into public.audit_logs (
    actor_profile_id,
    family_id,
    action,
    resource_type,
    resource_id,
    metadata
  )
  values (
    new.profile_id,
    action_family_id,
    'ai_action_created',
    'ai_action',
    new.id,
    jsonb_build_object(
      'action_type', new.action_type,
      'status', new.status,
      'safe_summary', coalesce(new.action_payload->>'safe_summary', 'AI action draft created')
    )
  );

  return new;
end;
$$;

revoke all on function public.audit_ai_action_insert() from public;

drop trigger if exists audit_ai_action_insert on public.ai_actions;
create trigger audit_ai_action_insert
after insert on public.ai_actions
for each row execute function public.audit_ai_action_insert();
