create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.families (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) > 0),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.family_members (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  full_name text not null check (char_length(full_name) > 0),
  relationship text,
  blood_type text,
  allergies text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.medical_records (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.family_members(id) on delete cascade,
  title text not null check (char_length(title) > 0),
  notes text,
  record_date date,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.medical_documents (
  id uuid primary key default gen_random_uuid(),
  record_id uuid not null references public.medical_records(id) on delete cascade,
  storage_path text not null unique,
  file_name text not null,
  content_type text,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists families_owner_id_idx on public.families(owner_id);
create index if not exists family_members_family_id_idx on public.family_members(family_id);
create index if not exists medical_records_member_id_idx on public.medical_records(member_id);
create index if not exists medical_documents_record_id_idx on public.medical_documents(record_id);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$ language plpgsql;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles for each row execute function public.set_updated_at();

drop trigger if exists families_set_updated_at on public.families;
create trigger families_set_updated_at before update on public.families for each row execute function public.set_updated_at();

drop trigger if exists family_members_set_updated_at on public.family_members;
create trigger family_members_set_updated_at before update on public.family_members for each row execute function public.set_updated_at();

drop trigger if exists medical_records_set_updated_at on public.medical_records;
create trigger medical_records_set_updated_at before update on public.medical_records for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.families enable row level security;
alter table public.family_members enable row level security;
alter table public.medical_records enable row level security;
alter table public.medical_documents enable row level security;

grant usage on schema public to authenticated;
grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.families to authenticated;
grant select, insert, update, delete on public.family_members to authenticated;
grant select, insert, update, delete on public.medical_records to authenticated;
grant select, insert, update, delete on public.medical_documents to authenticated;

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile" on public.profiles for select
to authenticated
using ((select auth.uid()) = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

drop policy if exists "Owners can manage families" on public.families;
create policy "Owners can manage families" on public.families for all
to authenticated
using ((select auth.uid()) = owner_id)
with check ((select auth.uid()) = owner_id);

drop policy if exists "Owners can manage family members" on public.family_members;
create policy "Owners can manage family members" on public.family_members for all
to authenticated
using (
  exists (
    select 1 from public.families
    where families.id = family_members.family_id
    and families.owner_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1 from public.families
    where families.id = family_members.family_id
    and families.owner_id = (select auth.uid())
  )
);

drop policy if exists "Owners can manage medical records" on public.medical_records;
create policy "Owners can manage medical records" on public.medical_records for all
to authenticated
using (
  exists (
    select 1
    from public.family_members
    join public.families on families.id = family_members.family_id
    where family_members.id = medical_records.member_id
    and families.owner_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.family_members
    join public.families on families.id = family_members.family_id
    where family_members.id = medical_records.member_id
    and families.owner_id = (select auth.uid())
  )
);

drop policy if exists "Owners can manage medical documents" on public.medical_documents;
create policy "Owners can manage medical documents" on public.medical_documents for all
to authenticated
using (
  exists (
    select 1
    from public.medical_records
    join public.family_members on family_members.id = medical_records.member_id
    join public.families on families.id = family_members.family_id
    where medical_records.id = medical_documents.record_id
    and families.owner_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.medical_records
    join public.family_members on family_members.id = medical_records.member_id
    join public.families on families.id = family_members.family_id
    where medical_records.id = medical_documents.record_id
    and families.owner_id = (select auth.uid())
  )
);
