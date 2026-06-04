-- Phase 10 Medication + Supplement Foundation schema draft.
-- Documentation only: do not apply this file as a migration in Phase 10.
-- Storage remains local-first in AsyncStorage until cloud persistence is added.

-- Supabase Data API note:
-- New tables in public may require explicit grants before supabase-js/PostgREST
-- can access them. Grants are separate from RLS. Enable RLS and ownership
-- policies before exposing any sensitive medication or supplement table.

create table if not exists public.medications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  profile_id uuid,
  name text not null,
  generic_name text,
  brand_name text,
  strength text,
  form text not null,
  dose_amount numeric,
  dose_unit text,
  instructions text,
  prescribed_by text,
  pharmacy text,
  start_date date,
  end_date date,
  reason text,
  notes text,
  is_private boolean not null default true,
  is_active boolean not null default true,
  shared_with_partner boolean not null default false,
  shared_with_family boolean not null default false,
  shared_with_caregiver boolean not null default false,
  locked_private boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.supplements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  profile_id uuid,
  name text not null,
  brand text,
  main_ingredient text,
  strength text,
  form text not null,
  serving_amount numeric,
  serving_unit text,
  instructions text,
  start_date date,
  end_date date,
  reason text,
  notes text,
  is_private boolean not null default true,
  is_active boolean not null default true,
  shared_with_partner boolean not null default false,
  shared_with_family boolean not null default false,
  shared_with_caregiver boolean not null default false,
  locked_private boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.health_schedules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  profile_id uuid,
  item_type text not null check (item_type in ('medication', 'supplement')),
  item_id uuid not null,
  timing text not null,
  times_json jsonb not null default '[]'::jsonb,
  days_of_week_json jsonb not null default '[]'::jsonb,
  every_x_hours numeric,
  food_timing text not null default 'none',
  custom_instructions text,
  reminder_enabled boolean not null default true,
  start_date date,
  end_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.dose_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  profile_id uuid,
  item_type text not null check (item_type in ('medication', 'supplement')),
  item_id uuid not null,
  schedule_id uuid references public.health_schedules(id) on delete set null,
  scheduled_at timestamptz,
  taken_at timestamptz,
  status text not null check (status in ('upcoming', 'due', 'taken', 'skipped', 'missed', 'snoozed')),
  amount numeric,
  unit text,
  food_timing_note text,
  side_effect_note text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.health_documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  profile_id uuid,
  related_type text not null,
  related_id uuid,
  title text not null,
  file_url text,
  file_type text check (file_type in ('image', 'pdf', 'note')),
  note_text text,
  is_private boolean not null default true,
  shared_with_partner boolean not null default false,
  shared_with_family boolean not null default false,
  shared_with_caregiver boolean not null default false,
  locked_private boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.medication_supplement_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  profile_id uuid,
  related_type text not null check (related_type in ('medication', 'supplement', 'general')),
  related_id uuid,
  note text not null,
  is_private boolean not null default true,
  shared_with_partner boolean not null default false,
  shared_with_family boolean not null default false,
  shared_with_caregiver boolean not null default false,
  locked_private boolean not null default true,
  logged_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists medications_user_active_idx on public.medications (user_id, is_active);
create index if not exists supplements_user_active_idx on public.supplements (user_id, is_active);
create index if not exists health_schedules_user_item_idx on public.health_schedules (user_id, item_type, item_id);
create index if not exists dose_logs_user_date_idx on public.dose_logs (user_id, scheduled_at desc, taken_at desc);
create index if not exists health_documents_user_related_idx on public.health_documents (user_id, related_type, related_id);
create index if not exists medication_supplement_notes_user_related_idx on public.medication_supplement_notes (user_id, related_type, related_id);

alter table public.medications enable row level security;
alter table public.supplements enable row level security;
alter table public.health_schedules enable row level security;
alter table public.dose_logs enable row level security;
alter table public.health_documents enable row level security;
alter table public.medication_supplement_notes enable row level security;

-- Policy pattern for each table. Repeat for select/insert/update/delete as needed.
create policy "Users can read their own medications"
on public.medications
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can insert their own medications"
on public.medications
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update their own medications"
on public.medications
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

-- Apply equivalent policies to supplements, health_schedules, dose_logs,
-- health_documents, and medication_supplement_notes before exposing them.

-- Example Data API grants if intentionally exposed after RLS review:
-- grant select, insert, update, delete on public.medications to authenticated;
-- grant select, insert, update, delete on public.supplements to authenticated;
-- grant select, insert, update, delete on public.health_schedules to authenticated;
-- grant select, insert, update, delete on public.dose_logs to authenticated;
-- grant select, insert, update, delete on public.health_documents to authenticated;
-- grant select, insert, update, delete on public.medication_supplement_notes to authenticated;
