-- Phase 11 Medication + Supplement Safety Layer schema draft.
-- Documentation only: do not apply this migration in Phase 11.
-- All safety data is local-first in AsyncStorage until Supabase persistence is added.
-- Policies should be created with "to authenticated" and "(select auth.uid()) = user_id".
-- New public tables may require explicit Data API grants depending on Supabase project settings.

create table if not exists public.medication_standard_matches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  profile_id uuid not null,
  medication_id uuid not null,
  source text not null default 'manual',
  source_concept_id text,
  display_name text not null,
  ingredient_name text,
  strength text,
  form text,
  confidence numeric(4, 3),
  confirmed_by_user boolean not null default false,
  matched_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists medication_standard_matches_user_profile_idx
  on public.medication_standard_matches (user_id, profile_id);

create index if not exists medication_standard_matches_medication_idx
  on public.medication_standard_matches (medication_id);

create table if not exists public.supplement_ingredient_matches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  profile_id uuid not null,
  supplement_id uuid not null,
  source text not null default 'manual',
  source_id text,
  display_name text not null,
  ingredient_name text not null,
  confidence numeric(4, 3),
  confirmed_by_user boolean not null default false,
  matched_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists supplement_ingredient_matches_user_profile_idx
  on public.supplement_ingredient_matches (user_id, profile_id);

create index if not exists supplement_ingredient_matches_supplement_idx
  on public.supplement_ingredient_matches (supplement_id);

create table if not exists public.safety_notices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  profile_id uuid not null,
  related_type text not null check (related_type in ('medication', 'supplement', 'profile')),
  related_id uuid,
  notice_type text not null,
  category text not null,
  title text not null,
  message text not null,
  source text not null default 'local',
  metadata_json jsonb not null default '{}'::jsonb,
  is_dismissed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists safety_notices_user_profile_idx
  on public.safety_notices (user_id, profile_id);

create index if not exists safety_notices_related_idx
  on public.safety_notices (related_type, related_id);

create table if not exists public.safety_checklist_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  profile_id uuid not null,
  related_type text not null check (related_type in ('medication', 'supplement')),
  related_id uuid not null,
  checklist_key text not null,
  label text not null,
  is_completed boolean not null default false,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists safety_checklist_items_user_profile_idx
  on public.safety_checklist_items (user_id, profile_id);

create index if not exists safety_checklist_items_related_idx
  on public.safety_checklist_items (related_type, related_id);

create table if not exists public.allergy_sensitivity_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  profile_id uuid not null,
  allergy_name text not null,
  allergy_type text not null default 'other',
  severity text not null default 'unknown',
  notes text,
  confirmed_by_professional boolean,
  visibility text not null default 'private',
  shared_with_partner boolean not null default false,
  shared_with_family boolean not null default false,
  shared_with_caregiver boolean not null default false,
  locked_private boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists allergy_sensitivity_notes_user_profile_idx
  on public.allergy_sensitivity_notes (user_id, profile_id);

-- Optional columns for Phase 10 base tables when this is applied later.
-- alter table public.medications
--   add column if not exists safety_status text not null default 'not_checked',
--   add column if not exists standard_match_id uuid references public.medication_standard_matches(id) on delete set null;
--
-- alter table public.supplements
--   add column if not exists safety_status text not null default 'not_checked',
--   add column if not exists ingredient_match_id uuid references public.supplement_ingredient_matches(id) on delete set null;

alter table public.medication_standard_matches enable row level security;
alter table public.supplement_ingredient_matches enable row level security;
alter table public.safety_notices enable row level security;
alter table public.safety_checklist_items enable row level security;
alter table public.allergy_sensitivity_notes enable row level security;

-- Example RLS policies for later application.
-- create policy "Users can read own medication standard matches"
--   on public.medication_standard_matches
--   for select
--   to authenticated
--   using ((select auth.uid()) = user_id);
--
-- create policy "Users can manage own medication standard matches"
--   on public.medication_standard_matches
--   for all
--   to authenticated
--   using ((select auth.uid()) = user_id)
--   with check ((select auth.uid()) = user_id);
--
-- Repeat the same ownership pattern for supplement_ingredient_matches,
-- safety_notices, safety_checklist_items, and allergy_sensitivity_notes.

-- Data API grant note:
-- If public table exposure is disabled for new tables, grant explicit API access
-- when ready, for example:
-- grant usage on schema public to authenticated;
-- grant select, insert, update, delete on table public.medication_standard_matches to authenticated;
-- grant select, insert, update, delete on table public.supplement_ingredient_matches to authenticated;
-- grant select, insert, update, delete on table public.safety_notices to authenticated;
-- grant select, insert, update, delete on table public.safety_checklist_items to authenticated;
-- grant select, insert, update, delete on table public.allergy_sensitivity_notes to authenticated;

