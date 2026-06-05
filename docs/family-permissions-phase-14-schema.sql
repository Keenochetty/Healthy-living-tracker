-- Phase 14 Family Circle + Permissions Integration schema draft
-- Documentation only. Do not apply this file as a migration in Phase 14.

create table if not exists public.family_circles (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null,
  name text not null,
  type text not null,
  description text,
  default_privacy_level text not null default 'private',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.health_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  created_by_user_id uuid not null,
  profile_type text not null,
  display_name text not null,
  date_of_birth date,
  gender text,
  avatar_url text,
  is_managed_profile boolean not null default false,
  is_adult_controlled boolean not null default true,
  adult_control_activated_at timestamptz,
  teen_privacy_transition_mode text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.family_circle_members (
  id uuid primary key default gen_random_uuid(),
  circle_id uuid not null references public.family_circles(id) on delete cascade,
  user_id uuid,
  profile_id uuid references public.health_profiles(id) on delete cascade,
  role text not null,
  display_name text not null,
  invite_status text not null default 'active',
  joined_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.profile_permissions (
  id uuid primary key default gen_random_uuid(),
  circle_id uuid references public.family_circles(id) on delete cascade,
  target_profile_id uuid not null references public.health_profiles(id) on delete cascade,
  granted_to_user_id uuid,
  granted_to_profile_id uuid references public.health_profiles(id) on delete cascade,
  role text,
  category text not null,
  permission_level text not null default 'none',
  can_view boolean not null default false,
  can_add boolean not null default false,
  can_edit boolean not null default false,
  can_manage boolean not null default false,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.caregiver_profiles (
  id uuid primary key default gen_random_uuid(),
  circle_id uuid references public.family_circles(id) on delete set null,
  assigned_profile_id uuid references public.health_profiles(id) on delete set null,
  name text not null,
  phone text,
  email text,
  role text,
  relationship text,
  rate_per_hour numeric,
  rate_per_day numeric,
  available_from time,
  available_to time,
  available_days_json jsonb not null default '[]'::jsonb,
  permissions_json jsonb not null default '[]'::jsonb,
  notes text,
  is_emergency_contact boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.family_invites (
  id uuid primary key default gen_random_uuid(),
  circle_id uuid not null references public.family_circles(id) on delete cascade,
  invited_by_user_id uuid not null,
  invited_email text,
  invited_phone text,
  role text not null,
  message text,
  status text not null default 'pending',
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.emergency_info_cards (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.health_profiles(id) on delete cascade,
  full_name text not null,
  date_of_birth date,
  emergency_contacts_json jsonb not null default '[]'::jsonb,
  allergies_json jsonb not null default '[]'::jsonb,
  medication_summary text,
  medical_notes text,
  blood_type text,
  doctor_clinic text,
  insurance_info text,
  visibility text not null default 'private',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.health_audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid not null,
  target_profile_id uuid references public.health_profiles(id) on delete set null,
  circle_id uuid references public.family_circles(id) on delete set null,
  action text not null,
  related_realm text,
  related_id text,
  metadata_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Optional future health_quick_widgets extensions:
-- alter table public.health_quick_widgets add column if not exists profile_id uuid references public.health_profiles(id) on delete cascade;
-- alter table public.health_quick_widgets add column if not exists visibility text not null default 'private';
-- alter table public.health_quick_widgets add column if not exists permission_required text;

create index if not exists family_circles_owner_idx on public.family_circles(owner_user_id);
create index if not exists health_profiles_user_idx on public.health_profiles(user_id);
create index if not exists health_profiles_created_by_idx on public.health_profiles(created_by_user_id);
create index if not exists family_circle_members_circle_idx on public.family_circle_members(circle_id);
create index if not exists family_circle_members_user_profile_idx on public.family_circle_members(user_id, profile_id);
create index if not exists profile_permissions_target_idx on public.profile_permissions(target_profile_id, category);
create index if not exists profile_permissions_grantee_idx on public.profile_permissions(granted_to_user_id, granted_to_profile_id);
create index if not exists caregiver_profiles_circle_idx on public.caregiver_profiles(circle_id);
create index if not exists caregiver_profiles_assigned_profile_idx on public.caregiver_profiles(assigned_profile_id);
create index if not exists family_invites_circle_status_idx on public.family_invites(circle_id, status);
create index if not exists emergency_info_cards_profile_idx on public.emergency_info_cards(profile_id);
create index if not exists health_audit_logs_target_idx on public.health_audit_logs(target_profile_id, created_at desc);
create index if not exists health_audit_logs_circle_idx on public.health_audit_logs(circle_id, created_at desc);

alter table public.family_circles enable row level security;
alter table public.health_profiles enable row level security;
alter table public.family_circle_members enable row level security;
alter table public.profile_permissions enable row level security;
alter table public.caregiver_profiles enable row level security;
alter table public.family_invites enable row level security;
alter table public.emergency_info_cards enable row level security;
alter table public.health_audit_logs enable row level security;

-- Policy examples. Refine granted-access predicates before applying in production.
create policy "Owners can manage family circles"
  on public.family_circles
  for all
  to authenticated
  using ((select auth.uid()) = owner_user_id)
  with check ((select auth.uid()) = owner_user_id);

create policy "Users can manage owned profiles"
  on public.health_profiles
  for all
  to authenticated
  using ((select auth.uid()) = user_id or (select auth.uid()) = created_by_user_id)
  with check ((select auth.uid()) = user_id or (select auth.uid()) = created_by_user_id);

create policy "Users can read explicitly granted profile permissions"
  on public.profile_permissions
  for select
  to authenticated
  using ((select auth.uid()) = granted_to_user_id);

create policy "Invite creators can manage invites"
  on public.family_invites
  for all
  to authenticated
  using ((select auth.uid()) = invited_by_user_id)
  with check ((select auth.uid()) = invited_by_user_id);

create policy "Audit actors can read their audit logs"
  on public.health_audit_logs
  for select
  to authenticated
  using ((select auth.uid()) = actor_user_id);

-- Depending on Supabase project settings, new public tables may need explicit
-- Data API grants before supabase-js or GraphQL clients can access them.
-- Example:
-- grant select, insert, update, delete on public.family_circles to authenticated;
-- grant select, insert, update, delete on public.health_profiles to authenticated;
-- grant select, insert, update, delete on public.family_circle_members to authenticated;
-- grant select, insert, update, delete on public.profile_permissions to authenticated;
-- grant select, insert, update, delete on public.caregiver_profiles to authenticated;
-- grant select, insert, update, delete on public.family_invites to authenticated;
-- grant select, insert, update, delete on public.emergency_info_cards to authenticated;
-- grant select, insert on public.health_audit_logs to authenticated;
