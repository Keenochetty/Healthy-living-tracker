-- Phase 12 Health Records + Document Vault schema draft.
-- Documentation only: do not apply this migration in Phase 12.
-- Records remain local-first in AsyncStorage until Supabase persistence is added.
-- Policies should use "to authenticated" plus "(select auth.uid()) = user_id".
-- New public tables may require explicit Data API grants depending on Supabase project settings.

create table if not exists public.health_record_folders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  profile_id uuid not null,
  name text not null,
  icon text,
  color text,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.doctor_visits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  profile_id uuid not null,
  title text not null,
  clinic_name text,
  practitioner_name text,
  specialty text,
  visit_date timestamptz not null,
  location text,
  reason text,
  summary_notes text,
  follow_up_required boolean not null default false,
  follow_up_date date,
  questions_asked text,
  instructions text,
  related_document_ids jsonb not null default '[]'::jsonb,
  related_medication_ids jsonb not null default '[]'::jsonb,
  related_supplement_ids jsonb not null default '[]'::jsonb,
  is_private boolean not null default true,
  shared_with_partner boolean not null default false,
  shared_with_family boolean not null default false,
  shared_with_caregiver boolean not null default false,
  locked_private boolean not null default true,
  allowed_viewer_ids jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.health_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  profile_id uuid not null,
  title text not null,
  type text not null,
  folder_id uuid references public.health_record_folders(id) on delete set null,
  file_url text,
  file_type text,
  document_date date,
  expiry_date date,
  reminder_date date,
  notes text,
  tags_json jsonb not null default '[]'::jsonb,
  is_pinned boolean not null default false,
  is_private boolean not null default true,
  related_medication_id uuid,
  related_supplement_id uuid,
  related_visit_id uuid references public.doctor_visits(id) on delete set null,
  shared_with_partner boolean not null default false,
  shared_with_family boolean not null default false,
  shared_with_caregiver boolean not null default false,
  locked_private boolean not null default true,
  allowed_viewer_ids jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.vaccine_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  profile_id uuid not null,
  vaccine_name text not null,
  dose_number text,
  date_received date not null,
  location text,
  batch_number text,
  next_dose_date date,
  document_id uuid references public.health_records(id) on delete set null,
  notes text,
  is_private boolean not null default true,
  shared_with_partner boolean not null default false,
  shared_with_family boolean not null default false,
  shared_with_caregiver boolean not null default false,
  locked_private boolean not null default true,
  allowed_viewer_ids jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.lab_result_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  profile_id uuid not null,
  test_name text not null,
  provider text,
  test_date date not null,
  result_value text,
  unit text,
  reference_range text,
  document_id uuid references public.health_records(id) on delete set null,
  notes text,
  follow_up_date date,
  is_private boolean not null default true,
  shared_with_partner boolean not null default false,
  shared_with_family boolean not null default false,
  shared_with_caregiver boolean not null default false,
  locked_private boolean not null default true,
  allowed_viewer_ids jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.prescription_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  profile_id uuid not null,
  title text not null,
  provider text,
  date_issued date,
  expiry_date date,
  related_medication_id uuid,
  document_id uuid references public.health_records(id) on delete set null,
  repeat_prescription boolean not null default false,
  refill_reminder_date date,
  notes text,
  is_private boolean not null default true,
  shared_with_partner boolean not null default false,
  shared_with_family boolean not null default false,
  shared_with_caregiver boolean not null default false,
  locked_private boolean not null default true,
  allowed_viewer_ids jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.health_record_reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  profile_id uuid not null,
  related_record_id uuid references public.health_records(id) on delete cascade,
  related_visit_id uuid references public.doctor_visits(id) on delete cascade,
  type text not null,
  title text not null,
  reminder_date date not null,
  status text not null default 'upcoming',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists health_record_folders_user_profile_idx on public.health_record_folders (user_id, profile_id);
create index if not exists doctor_visits_user_profile_idx on public.doctor_visits (user_id, profile_id);
create index if not exists doctor_visits_follow_up_date_idx on public.doctor_visits (follow_up_date);
create index if not exists health_records_user_profile_idx on public.health_records (user_id, profile_id);
create index if not exists health_records_type_idx on public.health_records (type);
create index if not exists health_records_folder_idx on public.health_records (folder_id);
create index if not exists health_records_pinned_idx on public.health_records (is_pinned);
create index if not exists health_records_reminder_date_idx on public.health_records (reminder_date);
create index if not exists health_records_related_medication_idx on public.health_records (related_medication_id);
create index if not exists health_records_related_supplement_idx on public.health_records (related_supplement_id);
create index if not exists health_records_related_visit_idx on public.health_records (related_visit_id);
create index if not exists vaccine_records_user_profile_idx on public.vaccine_records (user_id, profile_id);
create index if not exists vaccine_records_next_dose_idx on public.vaccine_records (next_dose_date);
create index if not exists lab_result_records_user_profile_idx on public.lab_result_records (user_id, profile_id);
create index if not exists lab_result_records_follow_up_idx on public.lab_result_records (follow_up_date);
create index if not exists prescription_records_user_profile_idx on public.prescription_records (user_id, profile_id);
create index if not exists prescription_records_refill_idx on public.prescription_records (refill_reminder_date);
create index if not exists prescription_records_related_medication_idx on public.prescription_records (related_medication_id);
create index if not exists health_record_reminders_user_profile_idx on public.health_record_reminders (user_id, profile_id);
create index if not exists health_record_reminders_date_idx on public.health_record_reminders (reminder_date, status);

alter table public.health_record_folders enable row level security;
alter table public.doctor_visits enable row level security;
alter table public.health_records enable row level security;
alter table public.vaccine_records enable row level security;
alter table public.lab_result_records enable row level security;
alter table public.prescription_records enable row level security;
alter table public.health_record_reminders enable row level security;

-- Example ownership policies for later application.
-- create policy "Users can read own health records"
--   on public.health_records
--   for select
--   to authenticated
--   using ((select auth.uid()) = user_id);
--
-- create policy "Users can manage own health records"
--   on public.health_records
--   for all
--   to authenticated
--   using ((select auth.uid()) = user_id)
--   with check ((select auth.uid()) = user_id);
--
-- Repeat the same ownership pattern for health_record_folders, doctor_visits,
-- vaccine_records, lab_result_records, prescription_records, and health_record_reminders.

-- Data API grant note:
-- If public table exposure is disabled for new tables, grant explicit API access
-- when ready, for example:
-- grant usage on schema public to authenticated;
-- grant select, insert, update, delete on table public.health_record_folders to authenticated;
-- grant select, insert, update, delete on table public.doctor_visits to authenticated;
-- grant select, insert, update, delete on table public.health_records to authenticated;
-- grant select, insert, update, delete on table public.vaccine_records to authenticated;
-- grant select, insert, update, delete on table public.lab_result_records to authenticated;
-- grant select, insert, update, delete on table public.prescription_records to authenticated;
-- grant select, insert, update, delete on table public.health_record_reminders to authenticated;

