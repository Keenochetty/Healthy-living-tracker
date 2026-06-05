-- Phase 23 Privacy, Consent, Export/Delete + Audit schema draft.
-- Documentation only. Do not apply as a migration in this phase.
-- Prepared for legal review; this does not claim legal compliance.

create table if not exists public.consent_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  profile_id uuid,
  consent_type text not null,
  status text not null check (status in ('not_requested', 'granted', 'denied', 'revoked')),
  consent_version text not null,
  consent_text_hash text,
  source_screen text,
  granted_at timestamptz,
  revoked_at timestamptz,
  metadata_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.privacy_policy_versions (
  id uuid primary key default gen_random_uuid(),
  document_type text not null check (document_type in ('privacy_policy', 'terms', 'medical_disclaimer')),
  version text not null,
  title text not null,
  content text not null,
  status text not null check (status in ('draft', 'legal_review_needed', 'approved', 'published', 'archived')),
  effective_date timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.privacy_audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid not null,
  target_user_id uuid,
  target_profile_id uuid,
  action text not null,
  category text,
  related_id uuid,
  metadata_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.data_export_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  profile_id uuid,
  categories_json jsonb not null default '[]'::jsonb,
  status text not null check (status in ('requested', 'processing', 'ready', 'failed', 'expired')),
  file_url text,
  requested_at timestamptz not null default now(),
  completed_at timestamptz,
  expires_at timestamptz
);

create table if not exists public.data_deletion_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  profile_id uuid,
  deletion_type text not null,
  categories_json jsonb not null default '[]'::jsonb,
  status text not null check (status in ('requested', 'confirmed', 'processing', 'completed', 'cancelled', 'failed')),
  requested_at timestamptz not null default now(),
  confirmed_at timestamptz,
  completed_at timestamptz
);

alter table public.consent_records enable row level security;
alter table public.privacy_policy_versions enable row level security;
alter table public.privacy_audit_logs enable row level security;
alter table public.data_export_requests enable row level security;
alter table public.data_deletion_requests enable row level security;

create index if not exists consent_records_user_profile_idx on public.consent_records(user_id, profile_id, consent_type);
create index if not exists privacy_audit_logs_actor_idx on public.privacy_audit_logs(actor_user_id, created_at desc);
create index if not exists privacy_audit_logs_target_profile_idx on public.privacy_audit_logs(target_profile_id, created_at desc);
create index if not exists data_export_requests_user_idx on public.data_export_requests(user_id, requested_at desc);
create index if not exists data_deletion_requests_user_idx on public.data_deletion_requests(user_id, requested_at desc);

create policy "consent records owner select" on public.consent_records
for select to authenticated
using ((select auth.uid()) = user_id);

create policy "consent records owner insert" on public.consent_records
for insert to authenticated
with check ((select auth.uid()) = user_id);

create policy "consent records owner update" on public.consent_records
for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "privacy policy versions authenticated read" on public.privacy_policy_versions
for select to authenticated
using (true);

create policy "privacy audit owner select" on public.privacy_audit_logs
for select to authenticated
using ((select auth.uid()) = actor_user_id or (select auth.uid()) = target_user_id);

create policy "privacy audit owner insert" on public.privacy_audit_logs
for insert to authenticated
with check ((select auth.uid()) = actor_user_id);

create policy "data export owner select" on public.data_export_requests
for select to authenticated
using ((select auth.uid()) = user_id);

create policy "data export owner insert" on public.data_export_requests
for insert to authenticated
with check ((select auth.uid()) = user_id);

create policy "data deletion owner select" on public.data_deletion_requests
for select to authenticated
using ((select auth.uid()) = user_id);

create policy "data deletion owner insert" on public.data_deletion_requests
for insert to authenticated
with check ((select auth.uid()) = user_id);

-- Data API note:
-- Depending on Supabase project Data API settings, new public tables may not be exposed automatically.
-- If these tables are intentionally exposed through supabase-js, grant only the required privileges to authenticated
-- after RLS is enabled, for example:
-- grant select, insert, update on public.consent_records to authenticated;
