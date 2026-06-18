create extension if not exists pgcrypto;

do $$ begin
  create type public.healthos_record_category as enum (
    'prescription',
    'medication_label',
    'supplement_label',
    'doctor_note',
    'lab_report',
    'vaccine_card',
    'pregnancy_document',
    'baby_child_document',
    'medical_aid',
    'scan_upload',
    'general_health',
    'other'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.healthos_record_source_type as enum (
    'manual',
    'scan',
    'document_picker',
    'gallery',
    'ai_import',
    'linked_realm'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.healthos_record_review_status as enum (
    'draft',
    'needs_review',
    'reviewed',
    'saved',
    'archived',
    'rejected'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.healthos_record_privacy_scope as enum (
    'private',
    'selected',
    'caregiver_limited',
    'emergency'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.healthos_record_file_status as enum (
    'metadata_only',
    'pending_upload',
    'uploaded',
    'failed',
    'archived'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.healthos_record_linked_realm as enum (
    'records',
    'medication',
    'supplements',
    'pregnancy',
    'baby_child',
    'womens_health',
    'calendar',
    'health',
    'ai_import'
  );
exception when duplicate_object then null;
end $$;

create table if not exists public.records (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  subject_care_profile_id uuid references public.care_profiles(id) on delete set null,
  title text not null check (char_length(btrim(title)) > 0),
  category public.healthos_record_category not null default 'general_health',
  source_type public.healthos_record_source_type not null default 'manual',
  review_status public.healthos_record_review_status not null default 'saved',
  privacy_scope public.healthos_record_privacy_scope not null default 'private',
  document_date date,
  expires_at date,
  notes text,
  tags text[] not null default '{}',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.record_files (
  id uuid primary key default gen_random_uuid(),
  record_id uuid not null references public.records(id) on delete cascade,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  bucket_id text not null default 'health-records-private',
  storage_path text,
  original_file_name text,
  display_name text,
  content_type text,
  file_size_bytes bigint check (file_size_bytes is null or file_size_bytes >= 0),
  upload_status public.healthos_record_file_status not null default 'metadata_only',
  checksum_sha256 text,
  metadata jsonb not null default '{}'::jsonb,
  uploaded_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint record_files_storage_path_unique unique (bucket_id, storage_path),
  constraint record_files_storage_path_required check (
    upload_status in ('metadata_only', 'pending_upload', 'failed')
    or storage_path is not null
  )
);

create table if not exists public.record_links (
  id uuid primary key default gen_random_uuid(),
  record_id uuid not null references public.records(id) on delete cascade,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  linked_realm public.healthos_record_linked_realm not null,
  linked_entity_id text,
  link_label text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.record_extractions (
  id uuid primary key default gen_random_uuid(),
  record_id uuid not null references public.records(id) on delete cascade,
  record_file_id uuid references public.record_files(id) on delete set null,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  source_type public.healthos_record_source_type not null default 'ai_import',
  review_status public.healthos_record_review_status not null default 'needs_review',
  extracted_fields jsonb not null default '{}'::jsonb,
  warnings text[] not null default '{}',
  confidence numeric(5,4) check (confidence is null or (confidence >= 0 and confidence <= 1)),
  model_label text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.emergency_packet_items (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  subject_care_profile_id uuid references public.care_profiles(id) on delete cascade,
  record_id uuid references public.records(id) on delete cascade,
  item_type text not null default 'record',
  label text,
  sort_order integer not null default 0,
  is_enabled boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists records_owner_updated_idx on public.records(owner_user_id, updated_at desc);
create index if not exists records_subject_category_idx on public.records(subject_care_profile_id, category, updated_at desc);
create index if not exists records_review_status_idx on public.records(owner_user_id, review_status, updated_at desc);
create index if not exists record_files_record_idx on public.record_files(record_id, created_at desc);
create index if not exists record_files_owner_status_idx on public.record_files(owner_user_id, upload_status, updated_at desc);
create index if not exists record_links_record_idx on public.record_links(record_id, linked_realm);
create index if not exists record_extractions_record_idx on public.record_extractions(record_id, review_status);
create index if not exists emergency_packet_items_owner_subject_idx on public.emergency_packet_items(owner_user_id, subject_care_profile_id, sort_order);

drop trigger if exists records_set_updated_at on public.records;
create trigger records_set_updated_at before update on public.records
for each row execute function public.set_updated_at();

drop trigger if exists record_files_set_updated_at on public.record_files;
create trigger record_files_set_updated_at before update on public.record_files
for each row execute function public.set_updated_at();

drop trigger if exists record_links_set_updated_at on public.record_links;
create trigger record_links_set_updated_at before update on public.record_links
for each row execute function public.set_updated_at();

drop trigger if exists record_extractions_set_updated_at on public.record_extractions;
create trigger record_extractions_set_updated_at before update on public.record_extractions
for each row execute function public.set_updated_at();

drop trigger if exists emergency_packet_items_set_updated_at on public.emergency_packet_items;
create trigger emergency_packet_items_set_updated_at before update on public.emergency_packet_items
for each row execute function public.set_updated_at();

create or replace function public.owns_healthos_record(target_record_id uuid, target_user_id uuid)
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select exists (
    select 1
    from public.records r
    where r.id = target_record_id
      and r.owner_user_id = target_user_id
  );
$$;

create or replace function public.can_access_healthos_record(target_record_id uuid, target_user_id uuid)
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select exists (
    select 1
    from public.records r
    where r.id = target_record_id
      and (
        r.owner_user_id = target_user_id
        or exists (
          select 1
          from public.sharing_permissions sp
          left join public.family_circle_members fcm
            on fcm.id = sp.granted_to_member_id
          where sp.subject_care_profile_id = r.subject_care_profile_id
            and sp.permission_key in ('view_records_shared', 'emergency_packet_view')
            and sp.status = 'active'
            and (sp.expires_at is null or sp.expires_at > timezone('utc', now()))
            and (
              sp.granted_to_user_id = target_user_id
              or fcm.user_id = target_user_id
            )
        )
      )
  );
$$;

create or replace function public.can_access_healthos_record_file(target_record_file_id uuid, target_user_id uuid)
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select exists (
    select 1
    from public.record_files rf
    where rf.id = target_record_file_id
      and public.can_access_healthos_record(rf.record_id, target_user_id)
  );
$$;

alter table public.records enable row level security;
alter table public.record_files enable row level security;
alter table public.record_links enable row level security;
alter table public.record_extractions enable row level security;
alter table public.emergency_packet_items enable row level security;

grant usage on schema public to authenticated;
grant select, insert, update, delete on
  public.records,
  public.record_files,
  public.record_links,
  public.record_extractions,
  public.emergency_packet_items
to authenticated;

drop policy if exists "Owners and explicit record viewers can read records" on public.records;
create policy "Owners and explicit record viewers can read records"
on public.records for select
to authenticated
using (public.can_access_healthos_record(id, (select auth.uid())));

drop policy if exists "Owners can create records" on public.records;
create policy "Owners can create records"
on public.records for insert
to authenticated
with check (owner_user_id = (select auth.uid()));

drop policy if exists "Owners can update records" on public.records;
create policy "Owners can update records"
on public.records for update
to authenticated
using (owner_user_id = (select auth.uid()))
with check (owner_user_id = (select auth.uid()));

drop policy if exists "Owners can delete records" on public.records;
create policy "Owners can delete records"
on public.records for delete
to authenticated
using (owner_user_id = (select auth.uid()));

drop policy if exists "Owners and explicit record viewers can read record files" on public.record_files;
create policy "Owners and explicit record viewers can read record files"
on public.record_files for select
to authenticated
using (public.can_access_healthos_record(record_id, (select auth.uid())));

drop policy if exists "Owners can create record files" on public.record_files;
create policy "Owners can create record files"
on public.record_files for insert
to authenticated
with check (
  owner_user_id = (select auth.uid())
  and public.owns_healthos_record(record_id, (select auth.uid()))
);

drop policy if exists "Owners can update record files" on public.record_files;
create policy "Owners can update record files"
on public.record_files for update
to authenticated
using (owner_user_id = (select auth.uid()))
with check (
  owner_user_id = (select auth.uid())
  and public.owns_healthos_record(record_id, (select auth.uid()))
);

drop policy if exists "Owners can delete record files" on public.record_files;
create policy "Owners can delete record files"
on public.record_files for delete
to authenticated
using (owner_user_id = (select auth.uid()));

drop policy if exists "Owners can manage record links" on public.record_links;
create policy "Owners can manage record links"
on public.record_links for all
to authenticated
using (
  owner_user_id = (select auth.uid())
  and public.owns_healthos_record(record_id, (select auth.uid()))
)
with check (
  owner_user_id = (select auth.uid())
  and public.owns_healthos_record(record_id, (select auth.uid()))
);

drop policy if exists "Owners can manage extraction review metadata" on public.record_extractions;
create policy "Owners can manage extraction review metadata"
on public.record_extractions for all
to authenticated
using (
  owner_user_id = (select auth.uid())
  and public.owns_healthos_record(record_id, (select auth.uid()))
)
with check (
  owner_user_id = (select auth.uid())
  and public.owns_healthos_record(record_id, (select auth.uid()))
);

drop policy if exists "Owners can manage emergency packet items" on public.emergency_packet_items;
create policy "Owners can manage emergency packet items"
on public.emergency_packet_items for all
to authenticated
using (owner_user_id = (select auth.uid()))
with check (owner_user_id = (select auth.uid()));

insert into storage.buckets (id, name, public)
values ('health-records-private', 'health-records-private', false)
on conflict (id) do update set public = false;

drop policy if exists "Users can read authorized health record objects" on storage.objects;
create policy "Users can read authorized health record objects"
on storage.objects for select
to authenticated
using (
  bucket_id = 'health-records-private'
  and (
    (storage.foldername(name))[1] = (select auth.uid())::text
    or exists (
      select 1
      from public.record_files rf
      where rf.bucket_id = storage.objects.bucket_id
        and rf.storage_path = storage.objects.name
        and public.can_access_healthos_record_file(rf.id, (select auth.uid()))
    )
  )
);

drop policy if exists "Users can upload own health record objects" on storage.objects;
create policy "Users can upload own health record objects"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'health-records-private'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

drop policy if exists "Users can update own health record objects" on storage.objects;
create policy "Users can update own health record objects"
on storage.objects for update
to authenticated
using (
  bucket_id = 'health-records-private'
  and (storage.foldername(name))[1] = (select auth.uid())::text
)
with check (
  bucket_id = 'health-records-private'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

drop policy if exists "Users can delete own health record objects" on storage.objects;
create policy "Users can delete own health record objects"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'health-records-private'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);
