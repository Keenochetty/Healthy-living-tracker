-- Phase 9 Smart Logging schema draft.
-- Documentation only: do not apply this file as a migration in Phase 9.
-- Smart logging remains local-first in AsyncStorage until cloud storage is added.

-- Supabase note:
-- New public tables may not be exposed to the Data API automatically in current
-- Supabase projects. If these tables are applied later and accessed through
-- supabase-js/PostgREST/GraphQL, add explicit grants for authenticated users
-- after review, then enable RLS and ownership policies.

create table if not exists public.smart_log_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  profile_id uuid,
  method text not null check (
    method in (
      'meal_photo',
      'nutrition_label',
      'voice_log',
      'recipe_url',
      'repeat_meal',
      'quick_meal_builder'
    )
  ),
  status text not null default 'draft' check (
    status in ('draft', 'review', 'confirmed', 'cancelled', 'unavailable')
  ),
  entry_date date not null,
  meal_group text not null,
  image_uri text,
  input_text text,
  recipe_url text,
  message text,
  source_metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.smart_log_suggested_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  profile_id uuid,
  session_id uuid not null references public.smart_log_sessions(id) on delete cascade,
  status text not null default 'active' check (status in ('active', 'removed')),
  food_name text not null,
  meal_group text not null,
  quantity numeric not null default 1,
  unit text not null default 'serving',
  calories numeric not null default 0,
  protein_g numeric not null default 0,
  carbs_g numeric not null default 0,
  fat_g numeric not null default 0,
  fiber_g numeric,
  confidence numeric not null default 0,
  source text,
  source_food_id text,
  source_ref_id text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.smart_food_suggestions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  profile_id uuid,
  suggestion_type text not null,
  title text not null,
  message text not null,
  action_label text not null,
  route text not null,
  priority integer not null default 100,
  created_at timestamptz not null default now()
);

-- Optional future diary metadata columns, only add if not already present:
-- alter table public.nutrition_diary_entries
--   add column if not exists smart_log_session_id uuid references public.smart_log_sessions(id),
--   add column if not exists confirmation_source text check (
--     confirmation_source in ('manual_review', 'edited_suggestion', 'accepted_suggestion')
--   );

create index if not exists smart_log_sessions_user_date_idx
  on public.smart_log_sessions (user_id, entry_date desc);

create index if not exists smart_log_suggested_entries_session_idx
  on public.smart_log_suggested_entries (session_id);

create index if not exists smart_food_suggestions_user_created_idx
  on public.smart_food_suggestions (user_id, created_at desc);

alter table public.smart_log_sessions enable row level security;
alter table public.smart_log_suggested_entries enable row level security;
alter table public.smart_food_suggestions enable row level security;

-- RLS policy examples for later application.
-- Use TO authenticated with an ownership predicate; TO authenticated alone is
-- not enough authorization.

create policy "Users can read their own smart log sessions"
on public.smart_log_sessions
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can insert their own smart log sessions"
on public.smart_log_sessions
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update their own smart log sessions"
on public.smart_log_sessions
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can read their own suggested entries"
on public.smart_log_suggested_entries
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can insert their own suggested entries"
on public.smart_log_suggested_entries
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update their own suggested entries"
on public.smart_log_suggested_entries
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can read their own smart food suggestions"
on public.smart_food_suggestions
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can insert their own smart food suggestions"
on public.smart_food_suggestions
for insert
to authenticated
with check ((select auth.uid()) = user_id);

-- Example grants if these tables are intentionally exposed through the Data API:
-- grant select, insert, update, delete on public.smart_log_sessions to authenticated;
-- grant select, insert, update, delete on public.smart_log_suggested_entries to authenticated;
-- grant select, insert, update, delete on public.smart_food_suggestions to authenticated;
