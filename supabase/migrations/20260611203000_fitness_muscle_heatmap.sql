create extension if not exists pgcrypto;

create table if not exists public.fitness_muscle_groups (
  muscle_key text primary key,
  display_name text not null,
  body_region text not null default 'general',
  default_view text not null default 'front',
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.fitness_exercise_muscle_targets (
  id uuid primary key default gen_random_uuid(),
  exercise_id text not null references public.fitness_exercises(exercise_id) on delete cascade,
  muscle_key text not null references public.fitness_muscle_groups(muscle_key) on delete restrict,
  target_role text not null check (target_role in ('primary', 'secondary', 'stabilizer')),
  intensity numeric not null default 0.5 check (intensity >= 0 and intensity <= 1),
  view_hint text not null default 'front',
  created_at timestamptz not null default now(),
  unique (exercise_id, muscle_key, target_role)
);

create index if not exists idx_fitness_exercise_muscle_targets_exercise
on public.fitness_exercise_muscle_targets(exercise_id);

create index if not exists idx_fitness_exercise_muscle_targets_muscle
on public.fitness_exercise_muscle_targets(muscle_key);

create table if not exists public.user_muscle_load_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  profile_id uuid,
  workout_session_id text,
  exercise_id text,
  muscle_key text not null references public.fitness_muscle_groups(muscle_key) on delete restrict,
  load_score numeric not null default 0,
  intensity numeric not null default 0,
  source text not null default 'workout_completed',
  performed_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists idx_user_muscle_load_history_user_date
on public.user_muscle_load_history(user_id, performed_at desc);

create index if not exists idx_user_muscle_load_history_profile_date
on public.user_muscle_load_history(profile_id, performed_at desc);

insert into public.fitness_muscle_groups
  (muscle_key, display_name, body_region, default_view, sort_order)
values
  ('chest', 'Chest', 'upper_body', 'front', 10),
  ('upper_chest', 'Upper chest', 'upper_body', 'front', 11),
  ('front_shoulders', 'Front shoulders', 'upper_body', 'front', 20),
  ('side_shoulders', 'Side shoulders', 'upper_body', 'front', 21),
  ('rear_shoulders', 'Rear shoulders', 'upper_body', 'back', 22),
  ('biceps', 'Biceps', 'upper_body', 'front', 30),
  ('triceps', 'Triceps', 'upper_body', 'back', 31),
  ('forearms', 'Forearms', 'upper_body', 'front', 32),
  ('upper_back', 'Upper back', 'upper_body', 'back', 40),
  ('lats', 'Lats', 'upper_body', 'back', 41),
  ('traps', 'Traps', 'upper_body', 'back', 42),
  ('lower_back', 'Lower back', 'core', 'back', 43),
  ('abs', 'Abs', 'core', 'front', 50),
  ('obliques', 'Obliques', 'core', 'front', 51),
  ('glutes', 'Glutes', 'lower_body', 'back', 60),
  ('hip_flexors', 'Hip flexors', 'lower_body', 'front', 61),
  ('quads', 'Quads', 'lower_body', 'front', 70),
  ('hamstrings', 'Hamstrings', 'lower_body', 'back', 71),
  ('calves', 'Calves', 'lower_body', 'back', 72),
  ('adductors', 'Adductors', 'lower_body', 'front', 73),
  ('abductors', 'Abductors', 'lower_body', 'front', 74),
  ('neck', 'Neck', 'upper_body', 'front', 80)
on conflict (muscle_key) do update set
  display_name = excluded.display_name,
  body_region = excluded.body_region,
  default_view = excluded.default_view,
  sort_order = excluded.sort_order;

alter table public.fitness_muscle_groups enable row level security;
alter table public.fitness_exercise_muscle_targets enable row level security;
alter table public.user_muscle_load_history enable row level security;

drop policy if exists "Anyone can read fitness muscle groups" on public.fitness_muscle_groups;
create policy "Anyone can read fitness muscle groups"
on public.fitness_muscle_groups
for select
to anon, authenticated
using (true);

drop policy if exists "Anyone can read fitness exercise muscle targets" on public.fitness_exercise_muscle_targets;
create policy "Anyone can read fitness exercise muscle targets"
on public.fitness_exercise_muscle_targets
for select
to anon, authenticated
using (true);

drop policy if exists "Users can read own muscle load history" on public.user_muscle_load_history;
create policy "Users can read own muscle load history"
on public.user_muscle_load_history
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert own muscle load history" on public.user_muscle_load_history;
create policy "Users can insert own muscle load history"
on public.user_muscle_load_history
for insert
to authenticated
with check ((select auth.uid()) = user_id);

grant select on public.fitness_muscle_groups to anon, authenticated;
grant select on public.fitness_exercise_muscle_targets to anon, authenticated;
grant select, insert on public.user_muscle_load_history to authenticated;
