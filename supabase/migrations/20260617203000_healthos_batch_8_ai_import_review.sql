create extension if not exists pgcrypto;

create table if not exists public.ai_extraction_jobs (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  subject_care_profile_id uuid references public.care_profiles(id) on delete set null,
  source_type text not null,
  source_record_id uuid references public.records(id) on delete set null,
  source_file_id uuid,
  source_storage_path text,
  input_summary text,
  status text not null default 'queued',
  requested_target text,
  model_label text,
  error_message_privacy_safe text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  completed_at timestamptz,
  constraint ai_extraction_jobs_status_check check (
    status in ('queued', 'processing', 'needs_review', 'completed', 'failed', 'cancelled', 'deferred', 'unknown')
  )
);

comment on table public.ai_extraction_jobs is
  'Review-first AI extraction request metadata. Jobs do not create final health records.';
comment on column public.ai_extraction_jobs.source_storage_path is
  'Internal source pointer only. Do not expose this value in normal client UI.';

create table if not exists public.ai_import_envelopes (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  subject_care_profile_id uuid references public.care_profiles(id) on delete set null,
  extraction_job_id uuid references public.ai_extraction_jobs(id) on delete set null,
  detected_type text not null default 'unknown',
  primary_target text not null default 'none',
  secondary_targets text[] not null default '{}',
  title text,
  summary_privacy_safe text,
  review_status text not null default 'needs_review',
  confidence_label text not null default 'unknown',
  envelope_json jsonb not null default '{}'::jsonb,
  normalized_fields jsonb,
  warnings_json jsonb,
  source_evidence_json jsonb,
  created_from text not null default 'ai',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  reviewed_at timestamptz,
  dismissed_at timestamptz,
  imported_at timestamptz,
  constraint ai_import_envelopes_review_status_check check (
    review_status in ('needs_review', 'in_review', 'reviewed', 'imported', 'dismissed', 'failed', 'expired', 'unknown')
  ),
  constraint ai_import_envelopes_confidence_check check (
    confidence_label in ('high', 'medium', 'low', 'unknown')
  )
);

comment on table public.ai_import_envelopes is
  'Structured AI output candidates. These rows are review envelopes, not final saved realm data.';

create table if not exists public.ai_review_events (
  id uuid primary key default gen_random_uuid(),
  import_envelope_id uuid not null references public.ai_import_envelopes(id) on delete cascade,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  event_type text not null,
  target_realm text,
  target_row_id uuid,
  note_privacy_safe text,
  created_at timestamptz not null default timezone('utc', now())
);

comment on table public.ai_review_events is
  'Privacy-safe event history for AI import review lifecycle.';

create table if not exists public.ai_source_evidence (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  import_envelope_id uuid references public.ai_import_envelopes(id) on delete cascade,
  extraction_job_id uuid references public.ai_extraction_jobs(id) on delete cascade,
  source_type text not null,
  source_record_id uuid references public.records(id) on delete set null,
  source_file_id uuid,
  evidence_label text,
  evidence_summary text,
  storage_bucket text,
  storage_path text,
  created_at timestamptz not null default timezone('utc', now())
);

comment on table public.ai_source_evidence is
  'Private evidence metadata for AI import candidates. Storage paths do not grant object access.';

create index if not exists ai_extraction_jobs_owner_created_idx
  on public.ai_extraction_jobs(owner_user_id, created_at desc);
create index if not exists ai_extraction_jobs_owner_status_idx
  on public.ai_extraction_jobs(owner_user_id, status, created_at desc);
create index if not exists ai_extraction_jobs_source_record_idx
  on public.ai_extraction_jobs(source_record_id);

create index if not exists ai_import_envelopes_owner_created_idx
  on public.ai_import_envelopes(owner_user_id, created_at desc);
create index if not exists ai_import_envelopes_owner_review_idx
  on public.ai_import_envelopes(owner_user_id, review_status, created_at desc);
create index if not exists ai_import_envelopes_type_target_idx
  on public.ai_import_envelopes(owner_user_id, detected_type, primary_target);
create index if not exists ai_import_envelopes_extraction_job_idx
  on public.ai_import_envelopes(extraction_job_id);

create index if not exists ai_review_events_envelope_created_idx
  on public.ai_review_events(import_envelope_id, created_at desc);
create index if not exists ai_review_events_owner_created_idx
  on public.ai_review_events(owner_user_id, created_at desc);

create index if not exists ai_source_evidence_envelope_idx
  on public.ai_source_evidence(import_envelope_id);
create index if not exists ai_source_evidence_job_idx
  on public.ai_source_evidence(extraction_job_id);
create index if not exists ai_source_evidence_owner_created_idx
  on public.ai_source_evidence(owner_user_id, created_at desc);

drop trigger if exists ai_extraction_jobs_set_updated_at on public.ai_extraction_jobs;
create trigger ai_extraction_jobs_set_updated_at before update on public.ai_extraction_jobs
for each row execute function public.set_updated_at();

drop trigger if exists ai_import_envelopes_set_updated_at on public.ai_import_envelopes;
create trigger ai_import_envelopes_set_updated_at before update on public.ai_import_envelopes
for each row execute function public.set_updated_at();

alter table public.ai_extraction_jobs enable row level security;
alter table public.ai_import_envelopes enable row level security;
alter table public.ai_review_events enable row level security;
alter table public.ai_source_evidence enable row level security;

grant select, insert, update, delete on
  public.ai_extraction_jobs,
  public.ai_import_envelopes,
  public.ai_review_events,
  public.ai_source_evidence
to authenticated;

drop policy if exists "Owners can read own AI extraction jobs" on public.ai_extraction_jobs;
create policy "Owners can read own AI extraction jobs"
on public.ai_extraction_jobs for select
to authenticated
using (owner_user_id = (select auth.uid()));

drop policy if exists "Owners can create own AI extraction jobs" on public.ai_extraction_jobs;
create policy "Owners can create own AI extraction jobs"
on public.ai_extraction_jobs for insert
to authenticated
with check (owner_user_id = (select auth.uid()));

drop policy if exists "Owners can update own AI extraction jobs" on public.ai_extraction_jobs;
create policy "Owners can update own AI extraction jobs"
on public.ai_extraction_jobs for update
to authenticated
using (owner_user_id = (select auth.uid()))
with check (owner_user_id = (select auth.uid()));

drop policy if exists "Owners can read own AI import envelopes" on public.ai_import_envelopes;
create policy "Owners can read own AI import envelopes"
on public.ai_import_envelopes for select
to authenticated
using (owner_user_id = (select auth.uid()));

drop policy if exists "Owners can create own AI import envelopes" on public.ai_import_envelopes;
create policy "Owners can create own AI import envelopes"
on public.ai_import_envelopes for insert
to authenticated
with check (
  owner_user_id = (select auth.uid())
  and (
    extraction_job_id is null
    or exists (
      select 1
      from public.ai_extraction_jobs
      where ai_extraction_jobs.id = extraction_job_id
        and ai_extraction_jobs.owner_user_id = (select auth.uid())
    )
  )
);

drop policy if exists "Owners can update own AI import envelopes" on public.ai_import_envelopes;
create policy "Owners can update own AI import envelopes"
on public.ai_import_envelopes for update
to authenticated
using (owner_user_id = (select auth.uid()))
with check (owner_user_id = (select auth.uid()));

drop policy if exists "Owners can read own AI review events" on public.ai_review_events;
create policy "Owners can read own AI review events"
on public.ai_review_events for select
to authenticated
using (owner_user_id = (select auth.uid()));

drop policy if exists "Owners can create own AI review events" on public.ai_review_events;
create policy "Owners can create own AI review events"
on public.ai_review_events for insert
to authenticated
with check (
  owner_user_id = (select auth.uid())
  and exists (
    select 1
    from public.ai_import_envelopes
    where ai_import_envelopes.id = import_envelope_id
      and ai_import_envelopes.owner_user_id = (select auth.uid())
  )
);

drop policy if exists "Owners can read own AI source evidence" on public.ai_source_evidence;
create policy "Owners can read own AI source evidence"
on public.ai_source_evidence for select
to authenticated
using (owner_user_id = (select auth.uid()));

drop policy if exists "Owners can create own AI source evidence" on public.ai_source_evidence;
create policy "Owners can create own AI source evidence"
on public.ai_source_evidence for insert
to authenticated
with check (owner_user_id = (select auth.uid()));
