-- Fitness pack v0.2 migration: YouTube embed sources, AI import, diet/exercise taxonomy, calendar activation, and history.
-- Keep this as an additive migration after supabase_fitness_schema.sql.
-- Do not store downloaded YouTube videos. Store metadata and video IDs only, then play with the official YouTube player.

alter table fitness_exercises add column if not exists youtube_video_id text;
alter table fitness_exercises add column if not exists youtube_video_url text;
alter table fitness_exercises add column if not exists youtube_channel_id text;
alter table fitness_exercises add column if not exists youtube_channel_title text;
alter table fitness_exercises add column if not exists youtube_thumbnail_url text;
alter table fitness_exercises add column if not exists youtube_license_type text;
alter table fitness_exercises add column if not exists youtube_embeddable boolean;
alter table fitness_exercises add column if not exists youtube_syndicated boolean;
alter table fitness_exercises add column if not exists youtube_review_status text default 'needs_manual_review';
alter table fitness_exercises add column if not exists youtube_attribution_text text;
alter table fitness_exercises add column if not exists youtube_last_checked_at timestamptz;
alter table fitness_exercises add column if not exists video_usage_policy text default 'embed_only_do_not_download_or_rehost';
alter table fitness_exercises add column if not exists ai_import_allowed boolean default true;
alter table fitness_exercises add column if not exists ai_import_safety_gate text;

create table if not exists fitness_exercise_video_sources (
  video_source_id text primary key,
  exercise_id text references fitness_exercises(exercise_id) on delete cascade,
  provider text not null default 'youtube',
  search_query text,
  youtube_video_id text,
  youtube_url text,
  youtube_embed_url text,
  channel_id text,
  channel_title text,
  video_title text,
  thumbnail_url text,
  license_type text,
  is_embeddable boolean,
  is_syndicated boolean,
  duration_seconds int,
  language text default 'en',
  audience_safety text,
  pregnancy_trimester text,
  review_status text default 'candidate_query_only_needs_manual_video_selection',
  usage_policy text default 'official_youtube_embed_only',
  created_version text,
  created_at timestamptz default now(),
  checked_at timestamptz
);

create table if not exists fitness_exercise_type_taxonomy (
  exercise_type_id text primary key,
  title text not null,
  description text,
  safe_audiences text,
  equipment_options text,
  risk_flags text,
  programming_notes text,
  created_at timestamptz default now()
);

create table if not exists fitness_diet_type_taxonomy (
  diet_type_id text primary key,
  title text not null,
  description text,
  audience_gate text,
  focus text,
  risk_flags text,
  app_notes text,
  created_at timestamptz default now()
);

create table if not exists user_imported_plans (
  imported_plan_id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  family_member_id uuid,
  plan_type text not null check (plan_type in ('workout','nutrition','health_care','mixed')),
  title text not null,
  goal text,
  audience text,
  difficulty text,
  duration_days int,
  days_per_week int,
  equipment text,
  source_urls text[],
  source_notes text,
  license_status text default 'needs_review',
  attribution_text text,
  ai_generated_summary text,
  normalized_plan_json jsonb not null default '{}'::jsonb,
  safety_flags text[],
  medical_review_required boolean default false,
  status text default 'draft' check (status in ('draft','preview_ready','active','paused','archived','deleted')),
  activated_at timestamptz,
  archived_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists user_imported_plan_days (
  imported_plan_day_id uuid primary key default gen_random_uuid(),
  imported_plan_id uuid references user_imported_plans(imported_plan_id) on delete cascade,
  day_number int not null,
  week_number int,
  title text,
  session_type text,
  target_minutes int,
  exercises jsonb default '[]'::jsonb,
  nutrition_targets jsonb default '{}'::jsonb,
  reminders jsonb default '[]'::jsonb,
  safety_notes text,
  created_at timestamptz default now()
);

create table if not exists user_plan_calendar_events (
  user_plan_calendar_event_id uuid primary key default gen_random_uuid(),
  imported_plan_id uuid references user_imported_plans(imported_plan_id) on delete cascade,
  imported_plan_day_id uuid references user_imported_plan_days(imported_plan_day_id) on delete set null,
  user_id uuid not null,
  calendar_event_id uuid,
  title text not null,
  start_at timestamptz not null,
  end_at timestamptz,
  event_kind text default 'workout',
  reminder_minutes int default 30,
  status text default 'scheduled' check (status in ('scheduled','completed','skipped','moved','cancelled')),
  created_at timestamptz default now()
);

create table if not exists user_fitness_history (
  history_id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  family_member_id uuid,
  event_key text not null,
  imported_plan_id uuid,
  exercise_id text,
  nutrition_template_id text,
  payload jsonb default '{}'::jsonb,
  occurred_at timestamptz default now()
);

create table if not exists ai_plan_search_logs (
  ai_plan_search_log_id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  query text not null,
  filters jsonb default '{}'::jsonb,
  sources_found jsonb default '[]'::jsonb,
  imported_plan_id uuid,
  status text default 'searched',
  created_at timestamptz default now()
);

create index if not exists idx_exercise_video_sources_exercise_id on fitness_exercise_video_sources(exercise_id);
create index if not exists idx_user_imported_plans_user_status on user_imported_plans(user_id, status);
create index if not exists idx_user_plan_calendar_events_user_start on user_plan_calendar_events(user_id, start_at);
create index if not exists idx_user_fitness_history_user_time on user_fitness_history(user_id, occurred_at desc);