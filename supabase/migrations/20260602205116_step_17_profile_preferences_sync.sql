create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  country text,
  language text default 'en',
  timezone text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles
  add column if not exists email text,
  add column if not exists full_name text,
  add column if not exists avatar_url text,
  add column if not exists country text,
  add column if not exists language text default 'en',
  add column if not exists timezone text,
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_id_auth_users_fkey'
      and conrelid = 'public.profiles'::regclass
  ) then
    alter table public.profiles
      add constraint profiles_id_auth_users_fkey
      foreign key (id) references auth.users(id) on delete cascade;
  end if;
end $$;

create table if not exists public.profile_settings (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  theme_key text default 'soft_lavender',
  currency text default 'ZAR',
  weight_unit text default 'kg',
  height_unit text default 'cm',
  liquid_unit text default 'ml',
  temperature_unit text default 'celsius',
  distance_unit text default 'km',
  speed_unit text default 'kmh',
  date_format text default 'dd/mm/yyyy',
  onboarding_complete boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(profile_id)
);

create table if not exists public.profile_modules (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  module_key text not null,
  enabled boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(profile_id, module_key)
);

create table if not exists public.profile_widgets (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  widget_key text not null,
  enabled boolean default true,
  size text default 'medium',
  sort_order int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(profile_id, widget_key)
);

alter table public.profile_settings enable row level security;
alter table public.profile_modules enable row level security;
alter table public.profile_widgets enable row level security;
alter table public.profiles enable row level security;

drop policy if exists "Users can select own profile" on public.profiles;
create policy "Users can select own profile"
on public.profiles
for select
to authenticated
using ((select auth.uid()) = id);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
on public.profiles
for insert
to authenticated
with check ((select auth.uid()) = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
on public.profiles
for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

drop policy if exists "Users can select own profile settings" on public.profile_settings;
create policy "Users can select own profile settings"
on public.profile_settings
for select
to authenticated
using ((select auth.uid()) = profile_id);

drop policy if exists "Users can insert own profile settings" on public.profile_settings;
create policy "Users can insert own profile settings"
on public.profile_settings
for insert
to authenticated
with check ((select auth.uid()) = profile_id);

drop policy if exists "Users can update own profile settings" on public.profile_settings;
create policy "Users can update own profile settings"
on public.profile_settings
for update
to authenticated
using ((select auth.uid()) = profile_id)
with check ((select auth.uid()) = profile_id);

drop policy if exists "Users can delete own profile settings" on public.profile_settings;
create policy "Users can delete own profile settings"
on public.profile_settings
for delete
to authenticated
using ((select auth.uid()) = profile_id);

drop policy if exists "Users can select own profile modules" on public.profile_modules;
create policy "Users can select own profile modules"
on public.profile_modules
for select
to authenticated
using ((select auth.uid()) = profile_id);

drop policy if exists "Users can insert own profile modules" on public.profile_modules;
create policy "Users can insert own profile modules"
on public.profile_modules
for insert
to authenticated
with check ((select auth.uid()) = profile_id);

drop policy if exists "Users can update own profile modules" on public.profile_modules;
create policy "Users can update own profile modules"
on public.profile_modules
for update
to authenticated
using ((select auth.uid()) = profile_id)
with check ((select auth.uid()) = profile_id);

drop policy if exists "Users can delete own profile modules" on public.profile_modules;
create policy "Users can delete own profile modules"
on public.profile_modules
for delete
to authenticated
using ((select auth.uid()) = profile_id);

drop policy if exists "Users can select own profile widgets" on public.profile_widgets;
create policy "Users can select own profile widgets"
on public.profile_widgets
for select
to authenticated
using ((select auth.uid()) = profile_id);

drop policy if exists "Users can insert own profile widgets" on public.profile_widgets;
create policy "Users can insert own profile widgets"
on public.profile_widgets
for insert
to authenticated
with check ((select auth.uid()) = profile_id);

drop policy if exists "Users can update own profile widgets" on public.profile_widgets;
create policy "Users can update own profile widgets"
on public.profile_widgets
for update
to authenticated
using ((select auth.uid()) = profile_id)
with check ((select auth.uid()) = profile_id);

drop policy if exists "Users can delete own profile widgets" on public.profile_widgets;
create policy "Users can delete own profile widgets"
on public.profile_widgets
for delete
to authenticated
using ((select auth.uid()) = profile_id);

grant select, insert, update on public.profiles to authenticated;
grant select, insert, update, delete on public.profile_settings to authenticated;
grant select, insert, update, delete on public.profile_modules to authenticated;
grant select, insert, update, delete on public.profile_widgets to authenticated;
