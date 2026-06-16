create extension if not exists pgcrypto;

create table if not exists public.healthsync_ai_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  active_profile_id uuid null,
  title text not null,
  source text not null check (
    source in ('chatgpt_user_account', 'manual_paste', 'healthsync_local')
  ),
  result_type text not null,
  status text not null default 'draft' check (
    status in ('draft', 'imported', 'dismissed')
  ),
  summary text,
  raw_text text,
  structured_result jsonb not null default '{}'::jsonb,
  import_targets text[] not null default '{}'::text[],
  confidence text null check (confidence in ('low', 'medium', 'high')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  imported_at timestamptz,
  dismissed_at timestamptz
);

create table if not exists public.healthsync_ai_imports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  session_id uuid not null references public.healthsync_ai_sessions(id) on delete cascade,
  target text not null,
  target_route text,
  status text not null default 'pending' check (
    status in ('pending', 'routed', 'saved', 'failed', 'cancelled')
  ),
  app_record_id uuid null,
  error_message text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists healthsync_ai_sessions_user_created_idx
  on public.healthsync_ai_sessions(user_id, created_at desc);
create index if not exists healthsync_ai_sessions_user_profile_created_idx
  on public.healthsync_ai_sessions(user_id, active_profile_id, created_at desc);
create index if not exists healthsync_ai_sessions_user_status_created_idx
  on public.healthsync_ai_sessions(user_id, status, created_at desc);
create index if not exists healthsync_ai_sessions_import_targets_idx
  on public.healthsync_ai_sessions using gin(import_targets);
create index if not exists healthsync_ai_imports_user_created_idx
  on public.healthsync_ai_imports(user_id, created_at desc);
create index if not exists healthsync_ai_imports_session_created_idx
  on public.healthsync_ai_imports(session_id, created_at desc);
create index if not exists healthsync_ai_imports_user_status_created_idx
  on public.healthsync_ai_imports(user_id, status, created_at desc);

alter table public.healthsync_ai_sessions enable row level security;
alter table public.healthsync_ai_imports enable row level security;

drop policy if exists "Users can read own HealthSync AI sessions"
  on public.healthsync_ai_sessions;
create policy "Users can read own HealthSync AI sessions"
on public.healthsync_ai_sessions
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert own HealthSync AI sessions"
  on public.healthsync_ai_sessions;
create policy "Users can insert own HealthSync AI sessions"
on public.healthsync_ai_sessions
for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update own HealthSync AI sessions"
  on public.healthsync_ai_sessions;
create policy "Users can update own HealthSync AI sessions"
on public.healthsync_ai_sessions
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete own HealthSync AI sessions"
  on public.healthsync_ai_sessions;
create policy "Users can delete own HealthSync AI sessions"
on public.healthsync_ai_sessions
for delete
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users can read own HealthSync AI imports"
  on public.healthsync_ai_imports;
create policy "Users can read own HealthSync AI imports"
on public.healthsync_ai_imports
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert own HealthSync AI imports"
  on public.healthsync_ai_imports;
create policy "Users can insert own HealthSync AI imports"
on public.healthsync_ai_imports
for insert
to authenticated
with check (
  (select auth.uid()) = user_id
  and exists (
    select 1
    from public.healthsync_ai_sessions
    where healthsync_ai_sessions.id = session_id
      and healthsync_ai_sessions.user_id = (select auth.uid())
  )
);

drop policy if exists "Users can update own HealthSync AI imports"
  on public.healthsync_ai_imports;
create policy "Users can update own HealthSync AI imports"
on public.healthsync_ai_imports
for update
to authenticated
using ((select auth.uid()) = user_id)
with check (
  (select auth.uid()) = user_id
  and exists (
    select 1
    from public.healthsync_ai_sessions
    where healthsync_ai_sessions.id = session_id
      and healthsync_ai_sessions.user_id = (select auth.uid())
  )
);

drop policy if exists "Users can delete own HealthSync AI imports"
  on public.healthsync_ai_imports;
create policy "Users can delete own HealthSync AI imports"
on public.healthsync_ai_imports
for delete
to authenticated
using ((select auth.uid()) = user_id);

drop trigger if exists healthsync_ai_sessions_set_updated_at
  on public.healthsync_ai_sessions;
create trigger healthsync_ai_sessions_set_updated_at
before update on public.healthsync_ai_sessions
for each row execute function public.set_updated_at();

drop trigger if exists healthsync_ai_imports_set_updated_at
  on public.healthsync_ai_imports;
create trigger healthsync_ai_imports_set_updated_at
before update on public.healthsync_ai_imports
for each row execute function public.set_updated_at();

grant select, insert, update, delete on
  public.healthsync_ai_sessions,
  public.healthsync_ai_imports
to authenticated;
