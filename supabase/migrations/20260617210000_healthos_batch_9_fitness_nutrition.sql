-- HealthOS Backend Batch 9: Fitness + Nutrition Backend Foundation
-- Draft-only migration. Do not apply remotely from Codex.

create extension if not exists pgcrypto;

create table if not exists public.fitness_goals (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  subject_care_profile_id uuid references public.care_profiles(id) on delete set null,
  title text not null,
  goal_type text not null default 'general',
  status text not null default 'draft',
  target_value numeric,
  target_unit text,
  start_date date,
  target_date date,
  privacy_scope text not null default 'private',
  source_type text not null default 'manual',
  source_record_id uuid references public.records(id) on delete set null,
  ai_import_id uuid references public.ai_import_envelopes(id) on delete set null,
  review_status text not null default 'user_entered',
  reviewed_at timestamptz,
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint fitness_goals_status_check check (status in ('draft', 'active', 'paused', 'completed', 'archived')),
  constraint fitness_goals_review_status_check check (review_status in ('user_entered', 'needs_review', 'reviewed', 'dismissed')),
  constraint fitness_goals_source_type_check check (source_type in ('manual', 'record', 'scan', 'ai_import'))
);

create table if not exists public.workout_plans (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  subject_care_profile_id uuid references public.care_profiles(id) on delete set null,
  fitness_goal_id uuid references public.fitness_goals(id) on delete set null,
  title text not null,
  description text,
  plan_type text not null default 'general',
  status text not null default 'draft',
  difficulty text,
  duration_weeks integer,
  days_per_week integer,
  equipment jsonb not null default '[]'::jsonb,
  schedule jsonb not null default '{}'::jsonb,
  source_type text not null default 'manual',
  source_record_id uuid references public.records(id) on delete set null,
  ai_import_id uuid references public.ai_import_envelopes(id) on delete set null,
  legacy_imported_plan_id uuid references public.user_imported_plans(id) on delete set null,
  review_status text not null default 'user_entered',
  reviewed_at timestamptz,
  safety_notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint workout_plans_status_check check (status in ('draft', 'active', 'paused', 'completed', 'archived')),
  constraint workout_plans_review_status_check check (review_status in ('user_entered', 'needs_review', 'reviewed', 'dismissed')),
  constraint workout_plans_source_type_check check (source_type in ('manual', 'record', 'scan', 'ai_import'))
);

create table if not exists public.workout_sessions (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  subject_care_profile_id uuid references public.care_profiles(id) on delete set null,
  workout_plan_id uuid references public.workout_plans(id) on delete set null,
  fitness_goal_id uuid references public.fitness_goals(id) on delete set null,
  linked_calendar_event_id uuid references public.calendar_events(id) on delete set null,
  linked_reminder_id uuid references public.reminders(id) on delete set null,
  title text not null,
  session_date date not null default current_date,
  started_at timestamptz,
  completed_at timestamptz,
  duration_minutes integer,
  perceived_effort integer,
  status text not null default 'planned',
  source_type text not null default 'manual',
  source_record_id uuid references public.records(id) on delete set null,
  ai_import_id uuid references public.ai_import_envelopes(id) on delete set null,
  review_status text not null default 'user_entered',
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint workout_sessions_status_check check (status in ('planned', 'in_progress', 'completed', 'skipped', 'cancelled')),
  constraint workout_sessions_review_status_check check (review_status in ('user_entered', 'needs_review', 'reviewed', 'dismissed')),
  constraint workout_sessions_source_type_check check (source_type in ('manual', 'record', 'scan', 'ai_import'))
);

create table if not exists public.exercise_logs (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  workout_session_id uuid not null references public.workout_sessions(id) on delete cascade,
  exercise_name text not null,
  exercise_catalog_id text,
  order_index integer not null default 0,
  target_muscle_groups text[] not null default '{}'::text[],
  duration_minutes integer,
  distance_value numeric,
  distance_unit text,
  notes text,
  source_type text not null default 'manual',
  ai_import_id uuid references public.ai_import_envelopes(id) on delete set null,
  review_status text not null default 'user_entered',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint exercise_logs_review_status_check check (review_status in ('user_entered', 'needs_review', 'reviewed', 'dismissed')),
  constraint exercise_logs_source_type_check check (source_type in ('manual', 'record', 'scan', 'ai_import'))
);

create table if not exists public.exercise_set_logs (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  exercise_log_id uuid not null references public.exercise_logs(id) on delete cascade,
  set_index integer not null default 1,
  reps integer,
  weight_value numeric,
  weight_unit text,
  duration_seconds integer,
  distance_value numeric,
  distance_unit text,
  effort_rating integer,
  completed boolean not null default false,
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.muscle_focus_logs (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  subject_care_profile_id uuid references public.care_profiles(id) on delete set null,
  workout_session_id uuid references public.workout_sessions(id) on delete cascade,
  muscle_group text not null,
  focus_score numeric,
  soreness_level integer,
  logged_on date not null default current_date,
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.fitness_progress_notes (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  subject_care_profile_id uuid references public.care_profiles(id) on delete set null,
  fitness_goal_id uuid references public.fitness_goals(id) on delete set null,
  workout_session_id uuid references public.workout_sessions(id) on delete set null,
  note_date date not null default current_date,
  title text,
  body text not null,
  mood text,
  privacy_scope text not null default 'private',
  source_type text not null default 'manual',
  source_record_id uuid references public.records(id) on delete set null,
  ai_import_id uuid references public.ai_import_envelopes(id) on delete set null,
  review_status text not null default 'user_entered',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint fitness_progress_notes_review_status_check check (review_status in ('user_entered', 'needs_review', 'reviewed', 'dismissed')),
  constraint fitness_progress_notes_source_type_check check (source_type in ('manual', 'record', 'scan', 'ai_import'))
);

create table if not exists public.nutrition_goals (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  subject_care_profile_id uuid references public.care_profiles(id) on delete set null,
  title text not null,
  goal_type text not null default 'general',
  status text not null default 'draft',
  target_value numeric,
  target_unit text,
  start_date date,
  target_date date,
  privacy_scope text not null default 'private',
  source_type text not null default 'manual',
  source_record_id uuid references public.records(id) on delete set null,
  ai_import_id uuid references public.ai_import_envelopes(id) on delete set null,
  review_status text not null default 'user_entered',
  reviewed_at timestamptz,
  caution_note text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint nutrition_goals_status_check check (status in ('draft', 'active', 'paused', 'completed', 'archived')),
  constraint nutrition_goals_review_status_check check (review_status in ('user_entered', 'needs_review', 'reviewed', 'dismissed')),
  constraint nutrition_goals_source_type_check check (source_type in ('manual', 'record', 'scan', 'ai_import'))
);

create table if not exists public.food_items (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  display_name text not null,
  brand_name text,
  barcode text,
  serving_size text,
  nutrients jsonb not null default '{}'::jsonb,
  source_type text not null default 'manual',
  source_record_id uuid references public.records(id) on delete set null,
  ai_import_id uuid references public.ai_import_envelopes(id) on delete set null,
  review_status text not null default 'needs_review',
  reviewed_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint food_items_review_status_check check (review_status in ('user_entered', 'needs_review', 'reviewed', 'dismissed')),
  constraint food_items_source_type_check check (source_type in ('manual', 'record', 'scan', 'ai_import', 'barcode'))
);

create table if not exists public.meal_logs (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  subject_care_profile_id uuid references public.care_profiles(id) on delete set null,
  nutrition_goal_id uuid references public.nutrition_goals(id) on delete set null,
  meal_date date not null default current_date,
  meal_time timestamptz,
  meal_type text not null default 'meal',
  title text,
  notes text,
  privacy_scope text not null default 'private',
  source_type text not null default 'manual',
  source_record_id uuid references public.records(id) on delete set null,
  ai_import_id uuid references public.ai_import_envelopes(id) on delete set null,
  review_status text not null default 'user_entered',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint meal_logs_review_status_check check (review_status in ('user_entered', 'needs_review', 'reviewed', 'dismissed')),
  constraint meal_logs_source_type_check check (source_type in ('manual', 'record', 'scan', 'ai_import', 'barcode'))
);

create table if not exists public.meal_items (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  meal_log_id uuid not null references public.meal_logs(id) on delete cascade,
  food_item_id uuid references public.food_items(id) on delete set null,
  display_name text not null,
  quantity numeric,
  unit text,
  nutrients jsonb not null default '{}'::jsonb,
  source_type text not null default 'manual',
  ai_import_id uuid references public.ai_import_envelopes(id) on delete set null,
  review_status text not null default 'user_entered',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint meal_items_review_status_check check (review_status in ('user_entered', 'needs_review', 'reviewed', 'dismissed')),
  constraint meal_items_source_type_check check (source_type in ('manual', 'record', 'scan', 'ai_import', 'barcode'))
);

create table if not exists public.meal_plans (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  subject_care_profile_id uuid references public.care_profiles(id) on delete set null,
  nutrition_goal_id uuid references public.nutrition_goals(id) on delete set null,
  title text not null,
  description text,
  status text not null default 'draft',
  plan_days jsonb not null default '[]'::jsonb,
  grocery_summary jsonb not null default '{}'::jsonb,
  source_type text not null default 'manual',
  source_record_id uuid references public.records(id) on delete set null,
  ai_import_id uuid references public.ai_import_envelopes(id) on delete set null,
  review_status text not null default 'needs_review',
  reviewed_at timestamptz,
  caution_note text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint meal_plans_status_check check (status in ('draft', 'active', 'paused', 'completed', 'archived')),
  constraint meal_plans_review_status_check check (review_status in ('user_entered', 'needs_review', 'reviewed', 'dismissed')),
  constraint meal_plans_source_type_check check (source_type in ('manual', 'record', 'scan', 'ai_import'))
);

create table if not exists public.grocery_lists (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  subject_care_profile_id uuid references public.care_profiles(id) on delete set null,
  meal_plan_id uuid references public.meal_plans(id) on delete set null,
  title text not null,
  status text not null default 'draft',
  privacy_scope text not null default 'private',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint grocery_lists_status_check check (status in ('draft', 'active', 'completed', 'archived'))
);

create table if not exists public.grocery_list_items (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  grocery_list_id uuid not null references public.grocery_lists(id) on delete cascade,
  display_name text not null,
  quantity numeric,
  unit text,
  category text,
  checked boolean not null default false,
  source_type text not null default 'manual',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.hydration_logs (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  subject_care_profile_id uuid references public.care_profiles(id) on delete set null,
  logged_at timestamptz not null default now(),
  amount_value numeric not null,
  amount_unit text not null default 'ml',
  beverage_type text,
  source_type text not null default 'manual',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.nutrition_review_flags (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  subject_care_profile_id uuid references public.care_profiles(id) on delete set null,
  related_table text not null,
  related_id uuid,
  flag_type text not null,
  severity text not null default 'info',
  message text not null,
  status text not null default 'open',
  source_type text not null default 'system',
  ai_import_id uuid references public.ai_import_envelopes(id) on delete set null,
  resolved_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint nutrition_review_flags_status_check check (status in ('open', 'acknowledged', 'resolved', 'dismissed')),
  constraint nutrition_review_flags_severity_check check (severity in ('info', 'caution', 'warning'))
);

comment on table public.workout_plans is 'Review-first user-owned workout plan drafts and active plans. AI/record-derived plans must remain needs_review until user confirmation.';
comment on table public.meal_plans is 'Review-first user-owned meal plan drafts. This table stores plan structure only and does not implement prescription-grade nutrition planning.';
comment on table public.food_items is 'User-owned food item drafts or reviewed saved foods. External barcode/scan candidates are review-first.';
comment on table public.nutrition_review_flags is 'User-visible caution flags for nutrition candidates. Not a medical advice engine.';

create index if not exists fitness_goals_owner_status_idx on public.fitness_goals(owner_user_id, status);
create index if not exists fitness_goals_subject_idx on public.fitness_goals(subject_care_profile_id);
create index if not exists workout_plans_owner_status_idx on public.workout_plans(owner_user_id, status);
create index if not exists workout_plans_ai_import_idx on public.workout_plans(ai_import_id);
create index if not exists workout_sessions_owner_date_idx on public.workout_sessions(owner_user_id, session_date desc);
create index if not exists workout_sessions_calendar_idx on public.workout_sessions(linked_calendar_event_id);
create index if not exists exercise_logs_session_idx on public.exercise_logs(workout_session_id, order_index);
create index if not exists exercise_set_logs_exercise_idx on public.exercise_set_logs(exercise_log_id, set_index);
create index if not exists muscle_focus_logs_owner_date_idx on public.muscle_focus_logs(owner_user_id, logged_on desc);
create index if not exists fitness_progress_notes_owner_date_idx on public.fitness_progress_notes(owner_user_id, note_date desc);
create index if not exists nutrition_goals_owner_status_idx on public.nutrition_goals(owner_user_id, status);
create index if not exists food_items_owner_barcode_idx on public.food_items(owner_user_id, barcode);
create index if not exists meal_logs_owner_date_idx on public.meal_logs(owner_user_id, meal_date desc);
create index if not exists meal_items_meal_idx on public.meal_items(meal_log_id);
create index if not exists meal_plans_owner_status_idx on public.meal_plans(owner_user_id, status);
create index if not exists meal_plans_ai_import_idx on public.meal_plans(ai_import_id);
create index if not exists grocery_lists_owner_status_idx on public.grocery_lists(owner_user_id, status);
create index if not exists grocery_list_items_list_idx on public.grocery_list_items(grocery_list_id);
create index if not exists hydration_logs_owner_logged_idx on public.hydration_logs(owner_user_id, logged_at desc);
create index if not exists nutrition_review_flags_owner_status_idx on public.nutrition_review_flags(owner_user_id, status);

alter table public.fitness_goals enable row level security;
alter table public.workout_plans enable row level security;
alter table public.workout_sessions enable row level security;
alter table public.exercise_logs enable row level security;
alter table public.exercise_set_logs enable row level security;
alter table public.muscle_focus_logs enable row level security;
alter table public.fitness_progress_notes enable row level security;
alter table public.nutrition_goals enable row level security;
alter table public.food_items enable row level security;
alter table public.meal_logs enable row level security;
alter table public.meal_items enable row level security;
alter table public.meal_plans enable row level security;
alter table public.grocery_lists enable row level security;
alter table public.grocery_list_items enable row level security;
alter table public.hydration_logs enable row level security;
alter table public.nutrition_review_flags enable row level security;

grant select, insert, update, delete on public.fitness_goals to authenticated;
grant select, insert, update, delete on public.workout_plans to authenticated;
grant select, insert, update, delete on public.workout_sessions to authenticated;
grant select, insert, update, delete on public.exercise_logs to authenticated;
grant select, insert, update, delete on public.exercise_set_logs to authenticated;
grant select, insert, update, delete on public.muscle_focus_logs to authenticated;
grant select, insert, update, delete on public.fitness_progress_notes to authenticated;
grant select, insert, update, delete on public.nutrition_goals to authenticated;
grant select, insert, update, delete on public.food_items to authenticated;
grant select, insert, update, delete on public.meal_logs to authenticated;
grant select, insert, update, delete on public.meal_items to authenticated;
grant select, insert, update, delete on public.meal_plans to authenticated;
grant select, insert, update, delete on public.grocery_lists to authenticated;
grant select, insert, update, delete on public.grocery_list_items to authenticated;
grant select, insert, update, delete on public.hydration_logs to authenticated;
grant select, insert, update, delete on public.nutrition_review_flags to authenticated;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'fitness_goals', 'workout_plans', 'workout_sessions', 'muscle_focus_logs',
    'fitness_progress_notes', 'nutrition_goals', 'food_items', 'meal_logs',
    'meal_plans', 'grocery_lists', 'hydration_logs', 'nutrition_review_flags'
  ]
  loop
    execute format('drop policy if exists "%1$s_owner_manage" on public.%1$I', table_name);
    execute format(
      'create policy "%1$s_owner_manage" on public.%1$I for all to authenticated using ((select auth.uid()) = owner_user_id) with check ((select auth.uid()) = owner_user_id)',
      table_name
    );
  end loop;
end $$;

drop policy if exists "exercise_logs_owner_manage" on public.exercise_logs;
create policy "exercise_logs_owner_manage" on public.exercise_logs
  for all to authenticated
  using ((select auth.uid()) = owner_user_id)
  with check (
    (select auth.uid()) = owner_user_id
    and exists (
      select 1 from public.workout_sessions ws
      where ws.id = exercise_logs.workout_session_id
      and ws.owner_user_id = (select auth.uid())
    )
  );

drop policy if exists "exercise_set_logs_owner_manage" on public.exercise_set_logs;
create policy "exercise_set_logs_owner_manage" on public.exercise_set_logs
  for all to authenticated
  using ((select auth.uid()) = owner_user_id)
  with check (
    (select auth.uid()) = owner_user_id
    and exists (
      select 1 from public.exercise_logs el
      where el.id = exercise_set_logs.exercise_log_id
      and el.owner_user_id = (select auth.uid())
    )
  );

drop policy if exists "meal_items_owner_manage" on public.meal_items;
create policy "meal_items_owner_manage" on public.meal_items
  for all to authenticated
  using ((select auth.uid()) = owner_user_id)
  with check (
    (select auth.uid()) = owner_user_id
    and exists (
      select 1 from public.meal_logs ml
      where ml.id = meal_items.meal_log_id
      and ml.owner_user_id = (select auth.uid())
    )
  );

drop policy if exists "grocery_list_items_owner_manage" on public.grocery_list_items;
create policy "grocery_list_items_owner_manage" on public.grocery_list_items
  for all to authenticated
  using ((select auth.uid()) = owner_user_id)
  with check (
    (select auth.uid()) = owner_user_id
    and exists (
      select 1 from public.grocery_lists gl
      where gl.id = grocery_list_items.grocery_list_id
      and gl.owner_user_id = (select auth.uid())
    )
  );

drop trigger if exists set_fitness_goals_updated_at on public.fitness_goals;
create trigger set_fitness_goals_updated_at before update on public.fitness_goals for each row execute function public.set_updated_at();
drop trigger if exists set_workout_plans_updated_at on public.workout_plans;
create trigger set_workout_plans_updated_at before update on public.workout_plans for each row execute function public.set_updated_at();
drop trigger if exists set_workout_sessions_updated_at on public.workout_sessions;
create trigger set_workout_sessions_updated_at before update on public.workout_sessions for each row execute function public.set_updated_at();
drop trigger if exists set_exercise_logs_updated_at on public.exercise_logs;
create trigger set_exercise_logs_updated_at before update on public.exercise_logs for each row execute function public.set_updated_at();
drop trigger if exists set_exercise_set_logs_updated_at on public.exercise_set_logs;
create trigger set_exercise_set_logs_updated_at before update on public.exercise_set_logs for each row execute function public.set_updated_at();
drop trigger if exists set_muscle_focus_logs_updated_at on public.muscle_focus_logs;
create trigger set_muscle_focus_logs_updated_at before update on public.muscle_focus_logs for each row execute function public.set_updated_at();
drop trigger if exists set_fitness_progress_notes_updated_at on public.fitness_progress_notes;
create trigger set_fitness_progress_notes_updated_at before update on public.fitness_progress_notes for each row execute function public.set_updated_at();
drop trigger if exists set_nutrition_goals_updated_at on public.nutrition_goals;
create trigger set_nutrition_goals_updated_at before update on public.nutrition_goals for each row execute function public.set_updated_at();
drop trigger if exists set_food_items_updated_at on public.food_items;
create trigger set_food_items_updated_at before update on public.food_items for each row execute function public.set_updated_at();
drop trigger if exists set_meal_logs_updated_at on public.meal_logs;
create trigger set_meal_logs_updated_at before update on public.meal_logs for each row execute function public.set_updated_at();
drop trigger if exists set_meal_items_updated_at on public.meal_items;
create trigger set_meal_items_updated_at before update on public.meal_items for each row execute function public.set_updated_at();
drop trigger if exists set_meal_plans_updated_at on public.meal_plans;
create trigger set_meal_plans_updated_at before update on public.meal_plans for each row execute function public.set_updated_at();
drop trigger if exists set_grocery_lists_updated_at on public.grocery_lists;
create trigger set_grocery_lists_updated_at before update on public.grocery_lists for each row execute function public.set_updated_at();
drop trigger if exists set_grocery_list_items_updated_at on public.grocery_list_items;
create trigger set_grocery_list_items_updated_at before update on public.grocery_list_items for each row execute function public.set_updated_at();
drop trigger if exists set_hydration_logs_updated_at on public.hydration_logs;
create trigger set_hydration_logs_updated_at before update on public.hydration_logs for each row execute function public.set_updated_at();
drop trigger if exists set_nutrition_review_flags_updated_at on public.nutrition_review_flags;
create trigger set_nutrition_review_flags_updated_at before update on public.nutrition_review_flags for each row execute function public.set_updated_at();
