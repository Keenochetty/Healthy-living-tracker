alter table public.user_settings
  add column if not exists measurement_preferences jsonb default '{}'::jsonb;
