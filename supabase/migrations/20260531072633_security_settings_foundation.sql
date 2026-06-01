alter table public.user_settings
  add column if not exists security_preferences jsonb default '{}';
