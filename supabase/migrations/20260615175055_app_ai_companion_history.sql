create extension if not exists pgcrypto;

create table if not exists public.app_ai_chats (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'New chat',
  last_message_preview text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.app_ai_messages (
  id uuid primary key default gen_random_uuid(),
  chat_id uuid not null references public.app_ai_chats(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  sources jsonb not null default '[]'::jsonb,
  import_payload jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.app_ai_imports (
  id uuid primary key default gen_random_uuid(),
  chat_id uuid references public.app_ai_chats(id) on delete set null,
  message_id uuid references public.app_ai_messages(id) on delete set null,
  user_id uuid not null references auth.users(id) on delete cascade,
  target text not null,
  payload jsonb not null,
  status text not null default 'confirmed' check (status in ('confirmed', 'failed')),
  created_at timestamptz not null default now()
);

create table if not exists public.app_ai_actions (
  id uuid primary key default gen_random_uuid(),
  chat_id uuid references public.app_ai_chats(id) on delete set null,
  user_id uuid not null references auth.users(id) on delete cascade,
  action_type text not null,
  action_payload jsonb not null default '{}'::jsonb,
  confirmed boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.app_ai_scan_results (
  id uuid primary key default gen_random_uuid(),
  chat_id uuid references public.app_ai_chats(id) on delete set null,
  user_id uuid not null references auth.users(id) on delete cascade,
  input_type text not null check (input_type in ('photo', 'barcode', 'document')),
  source_reference text,
  result_payload jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists app_ai_chats_user_updated_idx
  on public.app_ai_chats(user_id, updated_at desc);
create index if not exists app_ai_messages_chat_created_idx
  on public.app_ai_messages(chat_id, created_at);
create index if not exists app_ai_messages_user_created_idx
  on public.app_ai_messages(user_id, created_at desc);
create index if not exists app_ai_imports_user_created_idx
  on public.app_ai_imports(user_id, created_at desc);
create index if not exists app_ai_actions_user_created_idx
  on public.app_ai_actions(user_id, created_at desc);
create index if not exists app_ai_scan_results_user_created_idx
  on public.app_ai_scan_results(user_id, created_at desc);

alter table public.app_ai_chats enable row level security;
alter table public.app_ai_messages enable row level security;
alter table public.app_ai_imports enable row level security;
alter table public.app_ai_actions enable row level security;
alter table public.app_ai_scan_results enable row level security;

create policy "Users manage own app AI chats" on public.app_ai_chats for all
to authenticated using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

create policy "Users manage own app AI messages" on public.app_ai_messages for all
to authenticated using (user_id = (select auth.uid()))
with check (
  user_id = (select auth.uid())
  and exists (
    select 1 from public.app_ai_chats
    where app_ai_chats.id = chat_id
      and app_ai_chats.user_id = (select auth.uid())
  )
);

create policy "Users manage own app AI imports" on public.app_ai_imports for all
to authenticated using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

create policy "Users manage own app AI actions" on public.app_ai_actions for all
to authenticated using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

create policy "Users manage own app AI scans" on public.app_ai_scan_results for all
to authenticated using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

grant select, insert, update, delete on
  public.app_ai_chats,
  public.app_ai_messages,
  public.app_ai_imports,
  public.app_ai_actions,
  public.app_ai_scan_results
to authenticated;
