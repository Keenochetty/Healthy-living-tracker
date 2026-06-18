-- HealthOS Backend Batch 6: Medication + Supplements Foundation
-- Additive draft only. Do not apply remotely until reviewed with the full migration chain.

create table if not exists public.medications (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid references auth.users(id) on delete cascade,
  subject_care_profile_id uuid references public.care_profiles(id) on delete set null,
  display_name text,
  generic_name text,
  brand_name text,
  form text,
  strength_text text,
  route_text text,
  instructions_text text,
  prescriber_name text,
  pharmacy_name text,
  start_date date,
  end_date date,
  status text not null default 'draft',
  review_status text not null default 'needs_review',
  source_type text not null default 'manual',
  source_record_id uuid references public.records(id) on delete set null,
  ai_import_id uuid,
  privacy_scope text not null default 'private',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz
);

alter table public.medications
  add column if not exists owner_user_id uuid references auth.users(id) on delete cascade,
  add column if not exists subject_care_profile_id uuid references public.care_profiles(id) on delete set null,
  add column if not exists display_name text,
  add column if not exists generic_name text,
  add column if not exists brand_name text,
  add column if not exists form text,
  add column if not exists strength_text text,
  add column if not exists route_text text,
  add column if not exists instructions_text text,
  add column if not exists prescriber_name text,
  add column if not exists pharmacy_name text,
  add column if not exists start_date date,
  add column if not exists end_date date,
  add column if not exists status text default 'draft',
  add column if not exists review_status text default 'needs_review',
  add column if not exists source_type text default 'manual',
  add column if not exists source_record_id uuid references public.records(id) on delete set null,
  add column if not exists ai_import_id uuid,
  add column if not exists privacy_scope text default 'private',
  add column if not exists archived_at timestamptz;

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'medications' and column_name = 'family_id'
  ) then
    alter table public.medications alter column family_id drop not null;
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'medications' and column_name = 'family_member_id'
  ) then
    alter table public.medications alter column family_member_id drop not null;
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'medications' and column_name = 'name'
  ) then
    alter table public.medications alter column name drop not null;
  end if;
end $$;

comment on table public.medications is
  'HealthOS medication metadata. This table stores reviewed/user-entered medication organization data only; it does not prescribe, recommend dosage, or provide interaction decisions.';
comment on column public.medications.instructions_text is
  'User-entered or reviewed label/instruction text only. HealthOS must not interpret this as medical advice.';
comment on column public.medications.review_status is
  'AI, scan, prescription, label, and record-derived entries must remain needs_review until user confirmation.';

create table if not exists public.medication_schedules (
  id uuid primary key default gen_random_uuid(),
  medication_id uuid not null references public.medications(id) on delete cascade,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  subject_care_profile_id uuid references public.care_profiles(id) on delete set null,
  schedule_label text,
  dose_text text,
  frequency_text text,
  time_of_day text[] not null default '{}',
  start_at timestamptz,
  end_at timestamptz,
  repeat_rule text,
  with_food text,
  status text not null default 'draft',
  review_status text not null default 'needs_review',
  linked_reminder_id uuid references public.reminders(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.medication_schedules is
  'User-reviewed medication schedule intent. A schedule is not an OS notification and does not recommend a dose.';

create table if not exists public.medication_logs (
  id uuid primary key default gen_random_uuid(),
  medication_id uuid not null references public.medications(id) on delete cascade,
  schedule_id uuid references public.medication_schedules(id) on delete set null,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  subject_care_profile_id uuid references public.care_profiles(id) on delete set null,
  event_type text not null,
  event_time timestamptz not null default now(),
  note text,
  source_reminder_id uuid references public.reminders(id) on delete set null,
  created_at timestamptz not null default now()
);

comment on table public.medication_logs is
  'User-reported medication log events. Missed-dose handling must not include medical instructions.';

create table if not exists public.medication_side_effect_notes (
  id uuid primary key default gen_random_uuid(),
  medication_id uuid references public.medications(id) on delete set null,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  subject_care_profile_id uuid references public.care_profiles(id) on delete set null,
  note_text text not null,
  severity text,
  started_at timestamptz,
  ended_at timestamptz,
  review_status text not null default 'user_note',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.medication_side_effect_notes is
  'Possible side-effect or symptom notes. HealthOS must not diagnose causation.';

create table if not exists public.medication_refill_reminders (
  id uuid primary key default gen_random_uuid(),
  medication_id uuid not null references public.medications(id) on delete cascade,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  subject_care_profile_id uuid references public.care_profiles(id) on delete set null,
  refill_due_at timestamptz,
  remaining_quantity_text text,
  status text not null default 'draft',
  linked_reminder_id uuid references public.reminders(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.medication_refill_reminders is
  'Refill planning metadata only. No pharmacy ordering or coverage lookup is implemented in Batch 6.';

create table if not exists public.supplements (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  subject_care_profile_id uuid references public.care_profiles(id) on delete set null,
  display_name text not null,
  brand_name text,
  ingredient_summary text,
  form text,
  strength_text text,
  instructions_text text,
  start_date date,
  end_date date,
  status text not null default 'draft',
  review_status text not null default 'needs_review',
  source_type text not null default 'manual',
  source_record_id uuid references public.records(id) on delete set null,
  ai_import_id uuid,
  privacy_scope text not null default 'private',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz
);

comment on table public.supplements is
  'HealthOS supplement metadata. Supplements are private by default and are not assumed safe or beneficial.';

create table if not exists public.supplement_schedules (
  id uuid primary key default gen_random_uuid(),
  supplement_id uuid not null references public.supplements(id) on delete cascade,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  subject_care_profile_id uuid references public.care_profiles(id) on delete set null,
  schedule_label text,
  dose_text text,
  frequency_text text,
  time_of_day text[] not null default '{}',
  start_at timestamptz,
  end_at timestamptz,
  repeat_rule text,
  with_food text,
  status text not null default 'draft',
  review_status text not null default 'needs_review',
  linked_reminder_id uuid references public.reminders(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.supplement_schedules is
  'User-reviewed supplement schedule intent. No dose or timing recommendations are generated.';

create table if not exists public.supplement_logs (
  id uuid primary key default gen_random_uuid(),
  supplement_id uuid not null references public.supplements(id) on delete cascade,
  schedule_id uuid references public.supplement_schedules(id) on delete set null,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  subject_care_profile_id uuid references public.care_profiles(id) on delete set null,
  event_type text not null,
  event_time timestamptz not null default now(),
  note text,
  source_reminder_id uuid references public.reminders(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.medication_review_flags (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  subject_care_profile_id uuid references public.care_profiles(id) on delete set null,
  medication_id uuid references public.medications(id) on delete cascade,
  supplement_id uuid references public.supplements(id) on delete cascade,
  flag_type text not null,
  message_privacy_safe text not null,
  source_type text not null default 'system',
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.medication_review_flags is
  'Review/caution prompts only. These are not clinical interaction decisions.';

alter table public.medications enable row level security;
alter table public.medication_schedules enable row level security;
alter table public.medication_logs enable row level security;
alter table public.medication_side_effect_notes enable row level security;
alter table public.medication_refill_reminders enable row level security;
alter table public.supplements enable row level security;
alter table public.supplement_schedules enable row level security;
alter table public.supplement_logs enable row level security;
alter table public.medication_review_flags enable row level security;

create index if not exists medications_owner_user_id_idx on public.medications(owner_user_id);
create index if not exists medications_subject_care_profile_id_idx on public.medications(subject_care_profile_id);
create index if not exists medications_review_status_idx on public.medications(review_status);
create index if not exists medications_source_record_id_idx on public.medications(source_record_id);
create index if not exists medications_ai_import_id_idx on public.medications(ai_import_id);
create index if not exists medication_schedules_medication_id_idx on public.medication_schedules(medication_id);
create index if not exists medication_schedules_owner_user_id_idx on public.medication_schedules(owner_user_id);
create index if not exists medication_logs_medication_id_idx on public.medication_logs(medication_id);
create index if not exists medication_logs_owner_user_id_idx on public.medication_logs(owner_user_id);
create index if not exists medication_side_effect_notes_owner_idx on public.medication_side_effect_notes(owner_user_id);
create index if not exists medication_refill_reminders_owner_idx on public.medication_refill_reminders(owner_user_id);
create index if not exists supplements_owner_user_id_idx on public.supplements(owner_user_id);
create index if not exists supplements_subject_care_profile_id_idx on public.supplements(subject_care_profile_id);
create index if not exists supplements_review_status_idx on public.supplements(review_status);
create index if not exists supplement_schedules_supplement_id_idx on public.supplement_schedules(supplement_id);
create index if not exists supplement_logs_supplement_id_idx on public.supplement_logs(supplement_id);
create index if not exists medication_review_flags_owner_idx on public.medication_review_flags(owner_user_id);

do $$
declare
  table_name text;
  owner_column text := 'owner_user_id';
begin
  foreach table_name in array array[
    'medications',
    'medication_schedules',
    'medication_logs',
    'medication_side_effect_notes',
    'medication_refill_reminders',
    'supplements',
    'supplement_schedules',
    'supplement_logs',
    'medication_review_flags'
  ] loop
    if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = table_name and policyname = 'Owners can read own ' || table_name) then
      execute format('create policy %I on public.%I for select to authenticated using ((select auth.uid()) = %I)', 'Owners can read own ' || table_name, table_name, owner_column);
    end if;
    if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = table_name and policyname = 'Owners can insert own ' || table_name) then
      execute format('create policy %I on public.%I for insert to authenticated with check ((select auth.uid()) = %I)', 'Owners can insert own ' || table_name, table_name, owner_column);
    end if;
    if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = table_name and policyname = 'Owners can update own ' || table_name) then
      execute format('create policy %I on public.%I for update to authenticated using ((select auth.uid()) = %I) with check ((select auth.uid()) = %I)', 'Owners can update own ' || table_name, table_name, owner_column, owner_column);
    end if;
    if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = table_name and policyname = 'Owners can delete own ' || table_name) then
      execute format('create policy %I on public.%I for delete to authenticated using ((select auth.uid()) = %I)', 'Owners can delete own ' || table_name, table_name, owner_column);
    end if;
  end loop;
end $$;
