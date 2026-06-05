-- Phase 24 Supabase Production Hardening + Storage Security.
-- Migration-ready draft. Review against the live schema before applying.
-- This file intentionally avoids service-role/client secrets.

create extension if not exists pgcrypto;

create or replace function public.auth_user_id()
returns uuid
language sql
stable
security invoker
set search_path = public
as $$
  select (select auth.uid());
$$;

create or replace function public.is_profile_owner(target_profile_id uuid)
returns boolean
language sql
stable
security invoker
set search_path = public
as $$
  select exists (
    select 1 from public.health_profiles hp
    where hp.id = target_profile_id
      and hp.user_id = public.auth_user_id()
  );
$$;

create or replace function public.is_profile_creator(target_profile_id uuid)
returns boolean
language sql
stable
security invoker
set search_path = public
as $$
  select exists (
    select 1 from public.health_profiles hp
    where hp.id = target_profile_id
      and hp.created_by_user_id = public.auth_user_id()
  );
$$;

create or replace function public.is_circle_owner(target_circle_id uuid)
returns boolean
language sql
stable
security invoker
set search_path = public
as $$
  select exists (
    select 1 from public.family_circles fc
    where fc.id = target_circle_id
      and fc.owner_user_id = public.auth_user_id()
  );
$$;

create or replace function public.is_circle_admin(target_circle_id uuid)
returns boolean
language sql
stable
security invoker
set search_path = public
as $$
  select public.is_circle_owner(target_circle_id)
    or exists (
      select 1 from public.family_circle_members fcm
      where fcm.circle_id = target_circle_id
        and fcm.user_id = public.auth_user_id()
        and fcm.role in ('admin', 'owner')
        and coalesce(fcm.status, 'active') = 'active'
    );
$$;

create or replace function public.is_child_profile(target_profile_id uuid)
returns boolean
language sql
stable
security invoker
set search_path = public
as $$
  select exists (
    select 1 from public.health_profiles hp
    where hp.id = target_profile_id
      and hp.profile_type in ('child', 'baby_child')
  );
$$;

create or replace function public.is_adult_profile(target_profile_id uuid)
returns boolean
language sql
stable
security invoker
set search_path = public
as $$
  select exists (
    select 1 from public.health_profiles hp
    where hp.id = target_profile_id
      and hp.profile_type in ('self', 'adult', 'partner', 'elder')
      and coalesce(hp.is_adult_controlled, true) = true
  );
$$;

create or replace function public.is_parent_guardian_of_profile(target_profile_id uuid)
returns boolean
language sql
stable
security invoker
set search_path = public
as $$
  select exists (
    select 1 from public.profile_permissions pp
    where pp.profile_id = target_profile_id
      and pp.granted_to_user_id = public.auth_user_id()
      and pp.role in ('parent_guardian', 'admin')
      and pp.status = 'active'
  );
$$;

create or replace function public.has_profile_permission(target_profile_id uuid, permission_category text, required_level text)
returns boolean
language sql
stable
security invoker
set search_path = public
as $$
  select public.is_profile_owner(target_profile_id)
    or (
      public.is_child_profile(target_profile_id)
      and public.is_parent_guardian_of_profile(target_profile_id)
      and not public.is_adult_profile(target_profile_id)
    )
    or exists (
      select 1 from public.profile_permissions pp
      where pp.profile_id = target_profile_id
        and pp.granted_to_user_id = public.auth_user_id()
        and pp.category = permission_category
        and pp.status = 'active'
        and (
          pp.permission_level = 'manage'
          or (required_level in ('view', 'add', 'edit') and pp.permission_level = 'edit')
          or (required_level in ('view', 'add') and pp.permission_level = 'add')
          or (required_level = 'view' and pp.permission_level = 'view')
        )
    );
$$;

create or replace function public.can_view_profile_data(target_profile_id uuid, permission_category text)
returns boolean language sql stable security invoker set search_path = public
as $$ select public.has_profile_permission(target_profile_id, permission_category, 'view'); $$;

create or replace function public.can_add_profile_data(target_profile_id uuid, permission_category text)
returns boolean language sql stable security invoker set search_path = public
as $$ select public.has_profile_permission(target_profile_id, permission_category, 'add'); $$;

create or replace function public.can_edit_profile_data(target_profile_id uuid, permission_category text)
returns boolean language sql stable security invoker set search_path = public
as $$ select public.has_profile_permission(target_profile_id, permission_category, 'edit'); $$;

create or replace function public.can_manage_profile_data(target_profile_id uuid, permission_category text)
returns boolean language sql stable security invoker set search_path = public
as $$ select public.has_profile_permission(target_profile_id, permission_category, 'manage'); $$;

create or replace function public.can_view_record(target_record_id uuid)
returns boolean
language sql
stable
security invoker
set search_path = public
as $$
  select exists (
    select 1 from public.health_records hr
    where hr.id = target_record_id
      and public.can_view_profile_data(hr.profile_id, 'records')
  );
$$;

create or replace function public.can_view_document(target_record_id uuid)
returns boolean
language sql
stable
security invoker
set search_path = public
as $$ select public.can_view_record(target_record_id); $$;

create or replace function public.can_view_womens_health_category(target_profile_id uuid, category text)
returns boolean language sql stable security invoker set search_path = public
as $$ select public.has_profile_permission(target_profile_id, 'womens_health:' || category, 'view') or public.can_view_profile_data(target_profile_id, 'womens_health'); $$;

create or replace function public.can_view_pregnancy_category(target_profile_id uuid, category text)
returns boolean language sql stable security invoker set search_path = public
as $$ select public.has_profile_permission(target_profile_id, 'pregnancy:' || category, 'view') or public.can_view_profile_data(target_profile_id, 'pregnancy'); $$;

create or replace function public.can_view_baby_child_section(child_profile_id uuid, section text)
returns boolean language sql stable security invoker set search_path = public
as $$ select public.has_profile_permission(child_profile_id, 'baby_child:' || section, 'view') or public.can_view_profile_data(child_profile_id, 'baby_child'); $$;

create or replace function public.can_view_mens_health_category(target_profile_id uuid, category text)
returns boolean language sql stable security invoker set search_path = public
as $$ select public.has_profile_permission(target_profile_id, 'mens_health:' || category, 'view') or public.can_view_profile_data(target_profile_id, 'mens_health'); $$;

create or replace function public.has_ai_consent(target_profile_id uuid, category text)
returns boolean
language sql
stable
security invoker
set search_path = public
as $$
  select exists (
    select 1 from public.consent_records cr
    where cr.profile_id = target_profile_id
      and cr.consent_type = 'ai_assistant'
      and cr.status = 'granted'
  )
  and public.can_view_profile_data(target_profile_id, category);
$$;

do $$
declare
  table_name text;
  sensitive_tables text[] := array[
    'health_profiles','family_circles','family_circle_members','profile_permissions','caregiver_profiles','emergency_info_cards',
    'health_quick_widgets','nutrition_diary_entries','custom_foods','saved_meals','recipes','workout_sessions','workout_sets',
    'personal_records','biometric_logs','medications','supplements','health_schedules','dose_logs','medication_standard_matches',
    'supplement_ingredient_matches','safety_notices','health_records','doctor_visits','vaccine_records','lab_result_records',
    'prescription_records','health_reminders','health_timeline_events','womens_health_settings','cycle_profiles','period_logs',
    'womens_symptom_logs','mood_energy_logs','contraception_methods','contraception_logs','womens_health_share_permissions',
    'pregnancy_profiles','pregnancy_appointments','pregnancy_symptom_logs','pregnancy_questions','pregnancy_share_permissions',
    'baby_child_profiles','baby_feeding_logs','baby_sleep_logs','baby_diaper_logs','baby_growth_logs','baby_milestone_logs',
    'baby_solid_food_logs','baby_vaccine_records','mens_health_settings','mens_health_check_ins','mens_health_symptom_logs',
    'mens_health_reminders','mens_health_questions','mens_health_share_permissions','assistant_settings','assistant_messages',
    'assistant_drafts','assistant_audit_logs','consent_records','privacy_audit_logs','synced_health_samples','health_sync_connections'
  ];
begin
  foreach table_name in array sensitive_tables loop
    if to_regclass('public.' || table_name) is not null then
      execute format('alter table public.%I enable row level security', table_name);
      execute format('alter table public.%I force row level security', table_name);
    end if;
  end loop;
end $$;

-- Representative owner/profile policies. Apply per table after verifying columns.
-- Example for a profile-scoped health table:
-- create policy "nutrition entries view by permission" on public.nutrition_diary_entries
-- for select to authenticated
-- using (public.can_view_profile_data(profile_id, 'nutrition'));
-- create policy "nutrition entries insert by permission" on public.nutrition_diary_entries
-- for insert to authenticated
-- with check (public.can_add_profile_data(profile_id, 'nutrition'));
-- create policy "nutrition entries update by permission" on public.nutrition_diary_entries
-- for update to authenticated
-- using (public.can_edit_profile_data(profile_id, 'nutrition'))
-- with check (public.can_edit_profile_data(profile_id, 'nutrition'));
-- create policy "nutrition entries delete by permission" on public.nutrition_diary_entries
-- for delete to authenticated
-- using (public.can_manage_profile_data(profile_id, 'nutrition'));

-- Storage buckets.
insert into storage.buckets (id, name, public)
values
  ('health-records-private', 'health-records-private', false),
  ('profile-avatars', 'profile-avatars', false),
  ('food-images', 'food-images', false),
  ('baby-records-private', 'baby-records-private', false),
  ('medication-labels-private', 'medication-labels-private', false),
  ('supplement-labels-private', 'supplement-labels-private', false),
  ('pregnancy-records-private', 'pregnancy-records-private', false),
  ('ai-temp-uploads', 'ai-temp-uploads', false)
on conflict (id) do update set public = excluded.public;

create policy "private health file upload own path" on storage.objects
for insert to authenticated
with check (
  bucket_id in (
    'health-records-private','profile-avatars','food-images','baby-records-private',
    'medication-labels-private','supplement-labels-private','pregnancy-records-private','ai-temp-uploads'
  )
  and owner = public.auth_user_id()
  and (storage.foldername(name))[1] = public.auth_user_id()::text
);

create policy "private health file read own path" on storage.objects
for select to authenticated
using (
  bucket_id in (
    'health-records-private','profile-avatars','food-images','baby-records-private',
    'medication-labels-private','supplement-labels-private','pregnancy-records-private','ai-temp-uploads'
  )
  and (
    owner = public.auth_user_id()
    or public.can_view_profile_data(((storage.foldername(name))[2])::uuid, 'records')
  )
);

create policy "private health file delete own path" on storage.objects
for delete to authenticated
using (
  bucket_id in (
    'health-records-private','profile-avatars','food-images','baby-records-private',
    'medication-labels-private','supplement-labels-private','pregnancy-records-private','ai-temp-uploads'
  )
  and owner = public.auth_user_id()
);

-- Performance indexes for common RLS columns. Run only after confirming columns exist.
-- create index if not exists table_user_id_idx on public.table_name(user_id);
-- create index if not exists table_profile_id_idx on public.table_name(profile_id);
-- create index if not exists table_profile_created_idx on public.table_name(profile_id, created_at desc);
-- create index if not exists profile_permissions_lookup_idx on public.profile_permissions(profile_id, granted_to_user_id, category, status);

-- Data API note:
-- New public tables may require explicit grants depending on Supabase project settings.
-- Grant only required privileges after RLS is enabled and policies are reviewed.
