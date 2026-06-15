create table if not exists public.user_feature_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  profile_id uuid references public.profiles(id) on delete cascade,
  feature_key text not null check (feature_key in (
    'fitness', 'nutrition', 'family_circle', 'muscle_growth', 'weight_loss',
    'family_planning', 'food_planning', 'daily_planning', 'workout_guide',
    'pregnancy', 'postpartum', 'child_care', 'teen_fitness', 'recovery',
    'mental_wellness', 'advanced_training', 'injury_conscious', 'ai_plan_import'
  )),
  enabled boolean not null default true,
  source text not null default 'manual',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists user_feature_preferences_user_feature_unique
  on public.user_feature_preferences(user_id, feature_key)
  where profile_id is null;

create unique index if not exists user_feature_preferences_profile_feature_unique
  on public.user_feature_preferences(user_id, profile_id, feature_key)
  where profile_id is not null;

create index if not exists user_feature_preferences_user_profile_idx
  on public.user_feature_preferences(user_id, profile_id);

alter table public.user_feature_preferences enable row level security;

grant select, insert, update, delete on public.user_feature_preferences to authenticated;

drop policy if exists "Users select own feature preferences" on public.user_feature_preferences;
create policy "Users select own feature preferences"
on public.user_feature_preferences for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users insert own feature preferences" on public.user_feature_preferences;
create policy "Users insert own feature preferences"
on public.user_feature_preferences for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "Users update own feature preferences" on public.user_feature_preferences;
create policy "Users update own feature preferences"
on public.user_feature_preferences for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Users delete own feature preferences" on public.user_feature_preferences;
create policy "Users delete own feature preferences"
on public.user_feature_preferences for delete
to authenticated
using ((select auth.uid()) = user_id);
