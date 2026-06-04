-- Phase 8 Device Sync Preparation schema draft.
-- Documentation only: do not apply this as a migration during Phase 8.
-- Device sync remains local-first and mock/manual in Expo for now.

create table if not exists public.health_sync_connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  profile_id uuid not null,
  source text not null check (source in ('apple_health', 'health_connect', 'manual', 'mock', 'unknown')),
  is_connected boolean not null default false,
  enabled_data_types_json jsonb not null default '[]'::jsonb,
  permission_status text not null default 'not_requested' check (
    permission_status in ('not_requested', 'granted', 'partial', 'denied', 'unavailable')
  ),
  last_sync_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.synced_health_samples (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  profile_id uuid not null,
  source text not null check (source in ('apple_health', 'health_connect', 'manual', 'mock', 'unknown')),
  source_sample_id text,
  data_type text not null check (
    data_type in (
      'steps',
      'distance',
      'workout',
      'running',
      'heart_rate',
      'resting_heart_rate',
      'sleep',
      'weight',
      'active_calories',
      'water',
      'blood_pressure',
      'blood_glucose'
    )
  ),
  value numeric not null,
  unit text not null,
  start_time timestamptz not null,
  end_time timestamptz,
  metadata_json jsonb not null default '{}'::jsonb,
  synced_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists public.health_sync_errors (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  profile_id uuid not null,
  source text not null check (source in ('apple_health', 'health_connect', 'manual', 'mock', 'unknown')),
  data_type text,
  error_code text not null,
  error_message text not null,
  occurred_at timestamptz not null,
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists health_sync_connections_user_profile_idx
  on public.health_sync_connections (user_id, profile_id, source);

create index if not exists synced_health_samples_user_profile_type_time_idx
  on public.synced_health_samples (user_id, profile_id, data_type, start_time desc);

create unique index if not exists synced_health_samples_source_sample_unique_idx
  on public.synced_health_samples (user_id, profile_id, source, source_sample_id)
  where source_sample_id is not null;

create index if not exists health_sync_errors_user_profile_time_idx
  on public.health_sync_errors (user_id, profile_id, occurred_at desc);

alter table public.health_sync_connections enable row level security;
alter table public.synced_health_samples enable row level security;
alter table public.health_sync_errors enable row level security;

-- RLS policy requirements when these tables are applied later:
-- Use explicit role targets and ownership predicates. Do not use auth.role().
-- Example for each table:
--
-- create policy "health sync connections select own"
--   on public.health_sync_connections
--   for select
--   to authenticated
--   using ((select auth.uid()) = user_id);
--
-- create policy "health sync connections insert own"
--   on public.health_sync_connections
--   for insert
--   to authenticated
--   with check ((select auth.uid()) = user_id);
--
-- create policy "health sync connections update own"
--   on public.health_sync_connections
--   for update
--   to authenticated
--   using ((select auth.uid()) = user_id)
--   with check ((select auth.uid()) = user_id);
--
-- create policy "health sync connections delete own"
--   on public.health_sync_connections
--   for delete
--   to authenticated
--   using ((select auth.uid()) = user_id);

-- Device sync data is sensitive. Keep anon access disabled.
-- Depending on Supabase project Data API settings, new public tables may not be
-- exposed to REST/GraphQL automatically. If these tables are intentionally used
-- through supabase-js later, grant only the minimum required privileges to
-- authenticated after RLS is enabled and policies are in place.
