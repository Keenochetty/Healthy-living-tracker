-- Phase 18 Trusted Health Content Library + Source Governance
-- Documentation-only SQL draft. Do not apply as a migration in Phase 18.
--
-- Content is calculated/served locally for now. These tables are a future
-- Supabase-ready registry for trusted sources, educational cards, disclaimers,
-- quality checks, and content/audit governance.
--
-- RLS guidance:
-- - Use policies scoped TO authenticated.
-- - For user-owned/admin draft rows, use predicates like (select auth.uid()) = created_by.
-- - For published registry reads, use explicit predicates such as status = 'published'.
-- - New public tables may need explicit Data API grants before supabase-js can
--   access them, depending on project settings.

create table if not exists public.trusted_sources (
  id uuid primary key default gen_random_uuid(),
  source_name text not null,
  source_organization text not null,
  source_url text not null,
  source_type text not null check (
    source_type in (
      'public_health_agency',
      'medical_association',
      'hospital_clinic',
      'peer_reviewed_journal',
      'official_label',
      'clinical_guideline',
      'patient_education',
      'government',
      'other'
    )
  ),
  source_tier text not null check (source_tier in ('tier_1', 'tier_2', 'tier_3', 'disallowed')),
  trust_status text not null default 'needs_review' check (trust_status in ('approved', 'needs_review', 'deprecated', 'blocked')),
  country text,
  specialty text,
  clinical_review_available boolean not null default false,
  source_review_cycle_months integer not null default 12,
  last_source_checked_at date,
  notes text,
  created_by uuid references auth.users(id) on delete set null,
  reviewed_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists trusted_sources_status_idx on public.trusted_sources (trust_status);
create index if not exists trusted_sources_tier_idx on public.trusted_sources (source_tier);
create index if not exists trusted_sources_org_idx on public.trusted_sources (source_organization);

alter table public.trusted_sources enable row level security;

create policy "trusted sources approved read"
  on public.trusted_sources
  for select
  to authenticated
  using (trust_status = 'approved');

create policy "trusted sources owner draft read"
  on public.trusted_sources
  for select
  to authenticated
  using ((select auth.uid()) = created_by);

create policy "trusted sources owner insert"
  on public.trusted_sources
  for insert
  to authenticated
  with check ((select auth.uid()) = created_by);

create policy "trusted sources owner update"
  on public.trusted_sources
  for update
  to authenticated
  using ((select auth.uid()) = created_by)
  with check ((select auth.uid()) = created_by);

create table if not exists public.trusted_health_content_cards (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references public.trusted_sources(id) on delete restrict,
  realm text not null check (
    realm in (
      'nutrition',
      'workout',
      'biometrics',
      'medication',
      'supplements',
      'womens_health',
      'pregnancy',
      'baby_child',
      'mens_health',
      'records',
      'calendar',
      'ai_assistant',
      'general'
    )
  ),
  title text not null,
  short_summary text not null,
  full_text text not null,
  topic_tags text[] not null default '{}',
  status text not null default 'draft' check (
    status in ('draft', 'source_needed', 'review_needed', 'approved', 'published', 'expired', 'archived', 'blocked')
  ),
  risk_level text not null check (risk_level in ('low', 'medium', 'high', 'critical')),
  disclaimer_key text not null,
  source_organization text not null,
  source_url text not null,
  author text,
  medical_reviewer text,
  reviewed_by uuid references auth.users(id) on delete set null,
  approved_by uuid references auth.users(id) on delete set null,
  created_by uuid references auth.users(id) on delete set null,
  reviewed_date date,
  published_date date,
  last_checked_date date not null,
  next_review_date date not null,
  version_number integer not null default 1,
  previous_version_id uuid references public.trusted_health_content_cards(id) on delete set null,
  change_summary text,
  country_codes text[] not null default '{}',
  age_group text check (age_group in ('adult', 'teen', 'child', 'baby', 'pregnancy', 'all')),
  pregnancy_relevant boolean not null default false,
  child_relevant boolean not null default false,
  emergency_relevant boolean not null default false,
  region_notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists trusted_content_realm_status_idx on public.trusted_health_content_cards (realm, status);
create index if not exists trusted_content_source_idx on public.trusted_health_content_cards (source_id);
create index if not exists trusted_content_review_idx on public.trusted_health_content_cards (next_review_date);
create index if not exists trusted_content_risk_idx on public.trusted_health_content_cards (risk_level);
create index if not exists trusted_content_tags_idx on public.trusted_health_content_cards using gin (topic_tags);

alter table public.trusted_health_content_cards enable row level security;

create policy "trusted content published read"
  on public.trusted_health_content_cards
  for select
  to authenticated
  using (status = 'published' and next_review_date >= current_date);

create policy "trusted content owner draft read"
  on public.trusted_health_content_cards
  for select
  to authenticated
  using ((select auth.uid()) = created_by);

create policy "trusted content owner insert"
  on public.trusted_health_content_cards
  for insert
  to authenticated
  with check ((select auth.uid()) = created_by);

create policy "trusted content owner update"
  on public.trusted_health_content_cards
  for update
  to authenticated
  using ((select auth.uid()) = created_by)
  with check ((select auth.uid()) = created_by);

create table if not exists public.health_content_disclaimers (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  title text not null,
  text text not null,
  applies_to_realms text[] not null default '{}',
  risk_levels text[] not null default '{}',
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists health_content_disclaimers_key_idx on public.health_content_disclaimers (key);

alter table public.health_content_disclaimers enable row level security;

create policy "health content disclaimers authenticated read"
  on public.health_content_disclaimers
  for select
  to authenticated
  using (true);

create policy "health content disclaimers owner write"
  on public.health_content_disclaimers
  for all
  to authenticated
  using ((select auth.uid()) = created_by)
  with check ((select auth.uid()) = created_by);

create table if not exists public.health_content_quality_checks (
  id uuid primary key default gen_random_uuid(),
  content_card_id uuid not null references public.trusted_health_content_cards(id) on delete cascade,
  checked_by uuid references auth.users(id) on delete set null,
  checked_at timestamptz not null default now(),
  has_trusted_source boolean not null default false,
  source_approved boolean not null default false,
  unsafe_wording_found boolean not null default false,
  medical_claim_found boolean not null default false,
  plain_language_passed boolean not null default false,
  disclaimer_assigned boolean not null default false,
  risk_level_assigned boolean not null default false,
  next_review_date_exists boolean not null default false,
  overall_status text not null check (overall_status in ('pass', 'needs_review', 'blocked')),
  notes text,
  metadata jsonb not null default '{}'::jsonb
);

create index if not exists health_content_quality_card_idx on public.health_content_quality_checks (content_card_id, checked_at desc);
create index if not exists health_content_quality_status_idx on public.health_content_quality_checks (overall_status);

alter table public.health_content_quality_checks enable row level security;

create policy "quality checks owner read"
  on public.health_content_quality_checks
  for select
  to authenticated
  using ((select auth.uid()) = checked_by);

create policy "quality checks owner insert"
  on public.health_content_quality_checks
  for insert
  to authenticated
  with check ((select auth.uid()) = checked_by);

create table if not exists public.health_content_audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references auth.users(id) on delete set null,
  action text not null,
  source_id uuid references public.trusted_sources(id) on delete set null,
  content_card_id uuid references public.trusted_health_content_cards(id) on delete set null,
  previous_value jsonb,
  new_value jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists health_content_audit_actor_idx on public.health_content_audit_logs (actor_user_id, created_at desc);
create index if not exists health_content_audit_card_idx on public.health_content_audit_logs (content_card_id, created_at desc);
create index if not exists health_content_audit_source_idx on public.health_content_audit_logs (source_id, created_at desc);

alter table public.health_content_audit_logs enable row level security;

create policy "content audit actor read"
  on public.health_content_audit_logs
  for select
  to authenticated
  using ((select auth.uid()) = actor_user_id);

create policy "content audit actor insert"
  on public.health_content_audit_logs
  for insert
  to authenticated
  with check ((select auth.uid()) = actor_user_id);

-- Optional grants for projects where new public tables are not exposed
-- automatically to the Data API. Review before applying in production.
-- grant usage on schema public to authenticated;
-- grant select on public.trusted_sources to authenticated;
-- grant select on public.trusted_health_content_cards to authenticated;
-- grant select on public.health_content_disclaimers to authenticated;
-- grant select, insert on public.health_content_quality_checks to authenticated;
-- grant select, insert on public.health_content_audit_logs to authenticated;
