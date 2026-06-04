-- Phase 6 Nutrition Reports + Insights schema draft.
-- Documentation only: do not apply this as a migration during Phase 6.
-- Reports are calculated live from local AsyncStorage for now. This optional table is
-- reserved for later server-side caching, export snapshots, or audit-friendly report history.

create table if not exists public.nutrition_report_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  profile_id uuid not null,
  report_range text not null check (report_range in ('today', '7_days', '30_days')),
  start_date date not null,
  end_date date not null,
  summary_json jsonb not null default '{}'::jsonb,
  insights_json jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint nutrition_report_snapshots_valid_range check (start_date <= end_date)
);

create index if not exists nutrition_report_snapshots_user_profile_range_idx
  on public.nutrition_report_snapshots (user_id, profile_id, report_range, start_date desc);

alter table public.nutrition_report_snapshots enable row level security;

-- RLS policy requirements when this table is applied later:
-- Use explicit role targets and ownership predicates. Do not use auth.role().
-- Example:
--
-- create policy "nutrition report snapshots select own"
--   on public.nutrition_report_snapshots
--   for select
--   to authenticated
--   using ((select auth.uid()) = user_id);
--
-- create policy "nutrition report snapshots insert own"
--   on public.nutrition_report_snapshots
--   for insert
--   to authenticated
--   with check ((select auth.uid()) = user_id);
--
-- create policy "nutrition report snapshots update own"
--   on public.nutrition_report_snapshots
--   for update
--   to authenticated
--   using ((select auth.uid()) = user_id)
--   with check ((select auth.uid()) = user_id);
--
-- create policy "nutrition report snapshots delete own"
--   on public.nutrition_report_snapshots
--   for delete
--   to authenticated
--   using ((select auth.uid()) = user_id);

-- Depending on Supabase project Data API settings, new public tables may not be
-- automatically exposed to REST/GraphQL. If this snapshot table is intentionally
-- accessed through supabase-js later, grant the minimum required privileges to
-- authenticated after RLS is enabled and policies are in place. Avoid anon access
-- for user-specific report snapshots.
