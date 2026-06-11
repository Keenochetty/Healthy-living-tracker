
-- Fitness content schema - safe seed pack v0.1
-- Review all pregnancy, baby, child, nutrition and advanced content with qualified professionals before production.

create table if not exists content_licenses (
  id uuid primary key default gen_random_uuid(),
  source_name text not null,
  source_url text,
  license_type text,
  license_url text,
  attribution_required boolean default false,
  attribution_text text,
  commercial_use_allowed boolean,
  modification_allowed boolean,
  review_status text default 'needs_review',
  created_at timestamptz default now()
);

create table if not exists fitness_exercises (
  exercise_id text primary key,
  title text not null,
  variant text,
  audience text not null,
  sex_focus text default 'unisex',
  age_min_months int,
  age_max_years numeric,
  pregnancy_trimester text,
  postpartum_min_weeks text,
  category text,
  subcategory text,
  goal_tags text,
  level text,
  intensity text,
  equipment text,
  location text,
  primary_muscles text,
  secondary_muscles text,
  movement_pattern text,
  setup text,
  instructions text,
  sets text,
  reps_or_duration text,
  rest_seconds text,
  tempo text,
  progression text,
  regression text,
  contraindications text,
  safety_flags text,
  medical_review_required boolean default false,
  nutrition_pairing text,
  recovery_notes text,
  muscle_map_view text,
  muscle_map_primary_layer_ids text,
  image_asset_id text,
  animation_keyframes text,
  youtube_search_query text,
  youtube_embed_url text,
  source_policy text,
  license_status text,
  review_status text default 'needs_review',
  created_version text,
  created_at timestamptz default now()
);

create table if not exists fitness_workout_programs (
  plan_id text primary key,
  title text not null,
  audience text,
  goal text,
  level text,
  duration_days int,
  weeks int,
  days_per_week int,
  equipment text,
  summary text,
  phase_logic text,
  progression_rule text,
  safety_notes text,
  review_status text,
  created_version text,
  created_at timestamptz default now()
);

create table if not exists fitness_workout_program_days (
  plan_day_id text primary key,
  plan_id text references fitness_workout_programs(plan_id) on delete cascade,
  day_number int,
  week_number int,
  is_training_day boolean,
  focus text,
  session_summary text,
  target_minutes int,
  exercise_filter_tags text,
  nutrition_focus text,
  recovery_focus text,
  created_version text
);

create table if not exists fitness_nutrition_templates (
  nutrition_template_id text primary key,
  title text not null,
  audience text,
  diet_style text,
  goal text,
  meal_schedule text,
  calorie_strategy text,
  macro_strategy text,
  hydration_strategy text,
  foods_to_prioritize text,
  foods_to_limit text,
  allergen_flags text,
  protein_guidance text,
  recovery_food_notes text,
  risk_notes text,
  data_source_hint text,
  created_version text,
  created_at timestamptz default now()
);

create table if not exists fitness_goal_progressions (
  goal_progression_id text primary key,
  title text not null,
  audience text,
  timeframe text,
  progression_logic text
);

create table if not exists fitness_safety_rules (
  safety_rule_id text primary key,
  title text not null,
  rule text not null
);

-- Suggested RLS once authenticated app users exist:
-- alter table fitness_exercises enable row level security;
-- create policy "approved public exercises readable" on fitness_exercises for select using (review_status in ('approved','needs_coach_review','needs_professional_review'));
-- admin/editor write policies should be added separately.
