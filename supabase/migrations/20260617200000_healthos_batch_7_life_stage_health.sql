-- HealthOS Backend Batch 7: Pregnancy, Women's Health, and Baby/Child Foundation
-- Additive draft only. Do not apply remotely until reviewed with the full migration chain.

create table if not exists public.pregnancy_profiles (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  subject_care_profile_id uuid references public.care_profiles(id) on delete set null,
  status text not null default 'draft',
  estimated_due_date date,
  last_menstrual_period_date date,
  pregnancy_start_source text,
  baby_nickname text,
  baby_sex text,
  privacy_scope text not null default 'private',
  review_status text not null default 'user_entered',
  source_record_id uuid references public.records(id) on delete set null,
  ai_import_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  ended_at timestamptz
);

comment on table public.pregnancy_profiles is
  'Private pregnancy tracking metadata. HealthOS stores user/provider-entered organization data only and must not diagnose, risk score, or predict outcomes.';

create table if not exists public.pregnancy_logs (
  id uuid primary key default gen_random_uuid(),
  pregnancy_profile_id uuid not null references public.pregnancy_profiles(id) on delete cascade,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  log_type text not null default 'note',
  log_date date not null default current_date,
  mood text,
  symptoms text[] not null default '{}',
  note text,
  severity text,
  privacy_scope text not null default 'private',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.pregnancy_logs is
  'User-entered pregnancy notes, mood, and symptoms. Symptoms are not diagnoses and urgent copy must direct professional care.';

create table if not exists public.pregnancy_appointments (
  id uuid primary key default gen_random_uuid(),
  pregnancy_profile_id uuid not null references public.pregnancy_profiles(id) on delete cascade,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  appointment_at timestamptz,
  provider_name text,
  location text,
  notes text,
  linked_calendar_event_id uuid references public.calendar_events(id) on delete set null,
  linked_reminder_id uuid references public.reminders(id) on delete set null,
  source_record_id uuid references public.records(id) on delete set null,
  status text not null default 'scheduled',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.pregnancy_checklists (
  id uuid primary key default gen_random_uuid(),
  pregnancy_profile_id uuid not null references public.pregnancy_profiles(id) on delete cascade,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  category text not null default 'general',
  title text not null,
  status text not null default 'todo',
  due_at timestamptz,
  linked_reminder_id uuid references public.reminders(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.pregnancy_care_team (
  id uuid primary key default gen_random_uuid(),
  pregnancy_profile_id uuid not null references public.pregnancy_profiles(id) on delete cascade,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  display_name text not null,
  role text,
  email text,
  phone text,
  access_status text not null default 'contact_only',
  can_view_summary boolean not null default false,
  can_add_note boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.pregnancy_care_team is
  'Contact-only pregnancy care team foundation. Professional portal access is deferred and must remain explicit.';

create table if not exists public.women_health_logs (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  subject_care_profile_id uuid references public.care_profiles(id) on delete set null,
  log_date date not null default current_date,
  log_type text not null default 'cycle',
  cycle_day integer,
  bleeding_level text,
  mood text,
  symptoms text[] not null default '{}',
  pain_level integer,
  temperature_text text,
  note text,
  privacy_scope text not null default 'private',
  source_type text not null default 'manual',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.women_health_logs is
  'Private women''s health, cycle, mood, and symptom logs. Estimates must not be presented as medical fact.';

create table if not exists public.contraception_logs (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  subject_care_profile_id uuid references public.care_profiles(id) on delete set null,
  method_type text not null,
  method_name text,
  start_date date,
  renewal_due_date date,
  reminder_id uuid references public.reminders(id) on delete set null,
  notes text,
  status text not null default 'active',
  privacy_scope text not null default 'private',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.contraception_logs is
  'Private contraception notes and renewal metadata only. HealthOS must not recommend contraception choices.';

create table if not exists public.sex_day_logs (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  subject_care_profile_id uuid references public.care_profiles(id) on delete set null,
  log_date date not null,
  protected_status text,
  note text,
  privacy_scope text not null default 'private',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.sex_day_logs is
  'Strictly private sex-day logs. Never expose through family, caregiver, or shared timeline access by default.';

create table if not exists public.child_care_logs (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  subject_care_profile_id uuid not null references public.care_profiles(id) on delete cascade,
  log_type text not null,
  log_time timestamptz not null default now(),
  summary_privacy_safe text,
  notes text,
  created_by uuid references auth.users(id) on delete set null,
  source_type text not null default 'manual',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.feeding_logs (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  subject_care_profile_id uuid not null references public.care_profiles(id) on delete cascade,
  feeding_type text not null,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  amount_text text,
  side text,
  notes text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.sleep_logs (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  subject_care_profile_id uuid not null references public.care_profiles(id) on delete cascade,
  started_at timestamptz not null,
  ended_at timestamptz,
  sleep_location text,
  quality_note text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.diaper_logs (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  subject_care_profile_id uuid not null references public.care_profiles(id) on delete cascade,
  logged_at timestamptz not null default now(),
  diaper_type text not null,
  notes text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.growth_measurements (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  subject_care_profile_id uuid not null references public.care_profiles(id) on delete cascade,
  measured_at date not null default current_date,
  weight_kg numeric,
  length_cm numeric,
  head_circumference_cm numeric,
  source_type text not null default 'manual',
  source_record_id uuid references public.records(id) on delete set null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.growth_measurements is
  'User-entered child growth measurements. No percentile engine is included in Batch 7.';

create table if not exists public.vaccine_records (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  subject_care_profile_id uuid not null references public.care_profiles(id) on delete cascade,
  vaccine_name text not null,
  dose_label text,
  given_at date,
  provider_name text,
  source_record_id uuid references public.records(id) on delete set null,
  linked_reminder_id uuid references public.reminders(id) on delete set null,
  status text not null default 'recorded',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.vaccine_records is
  'Vaccine record metadata only. HealthOS must not hardcode universal vaccine schedules as medical advice.';

create table if not exists public.milestone_logs (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  subject_care_profile_id uuid not null references public.care_profiles(id) on delete cascade,
  milestone_key text not null,
  milestone_label text not null,
  category text,
  observed_at date,
  status text not null default 'observed',
  source_reference text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.milestone_logs is
  'Developmental milestone observations only. Missing milestones are not diagnoses.';

create table if not exists public.solids_logs (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  subject_care_profile_id uuid not null references public.care_profiles(id) on delete cascade,
  food_name text not null,
  introduced_at date not null default current_date,
  reaction_note text,
  allergy_flag boolean not null default false,
  source_type text not null default 'manual',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.solids_logs is
  'Solids introduction observations only. Allergy flags are user observations, not diagnoses.';

create table if not exists public.child_medication_notes (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  subject_care_profile_id uuid not null references public.care_profiles(id) on delete cascade,
  note_text text not null,
  source_record_id uuid references public.records(id) on delete set null,
  linked_medication_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.child_medication_notes is
  'Child medication notes without dose calculation or advice.';

create table if not exists public.caregiver_notes (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  subject_care_profile_id uuid not null references public.care_profiles(id) on delete cascade,
  created_by uuid not null references auth.users(id) on delete cascade,
  note_type text not null default 'general',
  note_text text not null,
  visibility_scope text not null default 'guardian_only',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.caregiver_notes is
  'Limited caregiver note foundation. Caregiver access must remain explicit and does not grant full child health access.';

alter table public.pregnancy_profiles enable row level security;
alter table public.pregnancy_logs enable row level security;
alter table public.pregnancy_appointments enable row level security;
alter table public.pregnancy_checklists enable row level security;
alter table public.pregnancy_care_team enable row level security;
alter table public.women_health_logs enable row level security;
alter table public.contraception_logs enable row level security;
alter table public.sex_day_logs enable row level security;
alter table public.child_care_logs enable row level security;
alter table public.feeding_logs enable row level security;
alter table public.sleep_logs enable row level security;
alter table public.diaper_logs enable row level security;
alter table public.growth_measurements enable row level security;
alter table public.vaccine_records enable row level security;
alter table public.milestone_logs enable row level security;
alter table public.solids_logs enable row level security;
alter table public.child_medication_notes enable row level security;
alter table public.caregiver_notes enable row level security;

create index if not exists pregnancy_profiles_owner_idx on public.pregnancy_profiles(owner_user_id);
create index if not exists pregnancy_profiles_subject_idx on public.pregnancy_profiles(subject_care_profile_id);
create index if not exists pregnancy_logs_profile_date_idx on public.pregnancy_logs(pregnancy_profile_id, log_date desc);
create index if not exists pregnancy_appointments_profile_time_idx on public.pregnancy_appointments(pregnancy_profile_id, appointment_at);
create index if not exists pregnancy_checklists_profile_status_idx on public.pregnancy_checklists(pregnancy_profile_id, status);
create index if not exists pregnancy_care_team_profile_idx on public.pregnancy_care_team(pregnancy_profile_id);
create index if not exists women_health_logs_owner_date_idx on public.women_health_logs(owner_user_id, log_date desc);
create index if not exists contraception_logs_owner_status_idx on public.contraception_logs(owner_user_id, status);
create index if not exists sex_day_logs_owner_date_idx on public.sex_day_logs(owner_user_id, log_date desc);
create index if not exists child_care_logs_subject_time_idx on public.child_care_logs(subject_care_profile_id, log_time desc);
create index if not exists feeding_logs_subject_started_idx on public.feeding_logs(subject_care_profile_id, started_at desc);
create index if not exists sleep_logs_subject_started_idx on public.sleep_logs(subject_care_profile_id, started_at desc);
create index if not exists diaper_logs_subject_logged_idx on public.diaper_logs(subject_care_profile_id, logged_at desc);
create index if not exists growth_measurements_subject_date_idx on public.growth_measurements(subject_care_profile_id, measured_at desc);
create index if not exists vaccine_records_subject_status_idx on public.vaccine_records(subject_care_profile_id, status);
create index if not exists milestone_logs_subject_status_idx on public.milestone_logs(subject_care_profile_id, status);
create index if not exists solids_logs_subject_date_idx on public.solids_logs(subject_care_profile_id, introduced_at desc);
create index if not exists child_medication_notes_subject_idx on public.child_medication_notes(subject_care_profile_id);
create index if not exists caregiver_notes_subject_created_idx on public.caregiver_notes(subject_care_profile_id, created_at desc);

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'pregnancy_profiles',
    'pregnancy_logs',
    'pregnancy_appointments',
    'pregnancy_checklists',
    'pregnancy_care_team',
    'women_health_logs',
    'contraception_logs',
    'sex_day_logs',
    'child_care_logs',
    'feeding_logs',
    'sleep_logs',
    'diaper_logs',
    'growth_measurements',
    'vaccine_records',
    'milestone_logs',
    'solids_logs',
    'child_medication_notes',
    'caregiver_notes'
  ] loop
    if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = table_name and policyname = 'Owners can read own ' || table_name) then
      execute format('create policy %I on public.%I for select to authenticated using ((select auth.uid()) = owner_user_id)', 'Owners can read own ' || table_name, table_name);
    end if;
    if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = table_name and policyname = 'Owners can insert own ' || table_name) then
      execute format('create policy %I on public.%I for insert to authenticated with check ((select auth.uid()) = owner_user_id)', 'Owners can insert own ' || table_name, table_name);
    end if;
    if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = table_name and policyname = 'Owners can update own ' || table_name) then
      execute format('create policy %I on public.%I for update to authenticated using ((select auth.uid()) = owner_user_id) with check ((select auth.uid()) = owner_user_id)', 'Owners can update own ' || table_name, table_name);
    end if;
  end loop;
end $$;
