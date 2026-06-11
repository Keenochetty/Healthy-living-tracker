alter table public.profiles
  add column if not exists display_name text,
  add column if not exists date_of_birth date,
  add column if not exists phone text,
  add column if not exists preferred_contact_method text
    check (preferred_contact_method in ('email', 'phone', 'none'));

create table if not exists public.emergency_contacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  relationship text,
  phone text not null,
  secondary_contact text,
  visibility text not null default 'private'
    check (visibility in ('private', 'circle_admins', 'emergency_contacts')),
  include_in_medical_id boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.emergency_contacts enable row level security;
grant select, insert, update, delete on public.emergency_contacts to authenticated;

drop policy if exists "Users can manage own emergency contacts" on public.emergency_contacts;
create policy "Users can manage own emergency contacts"
on public.emergency_contacts for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

insert into storage.buckets (id, name, public)
values ('profile-avatars', 'profile-avatars', false)
on conflict (id) do update set public = excluded.public;

drop policy if exists "Users can read own profile avatars" on storage.objects;
create policy "Users can read own profile avatars"
on storage.objects for select
to authenticated
using (bucket_id = 'profile-avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists "Users can upload own profile avatars" on storage.objects;
create policy "Users can upload own profile avatars"
on storage.objects for insert
to authenticated
with check (bucket_id = 'profile-avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists "Users can update own profile avatars" on storage.objects;
create policy "Users can update own profile avatars"
on storage.objects for update
to authenticated
using (bucket_id = 'profile-avatars' and (storage.foldername(name))[1] = (select auth.uid())::text)
with check (bucket_id = 'profile-avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists "Users can delete own profile avatars" on storage.objects;
create policy "Users can delete own profile avatars"
on storage.objects for delete
to authenticated
using (bucket_id = 'profile-avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
