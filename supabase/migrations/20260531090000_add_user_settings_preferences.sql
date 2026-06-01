alter table public.user_settings
  add column if not exists preferences jsonb default '{}'::jsonb;
