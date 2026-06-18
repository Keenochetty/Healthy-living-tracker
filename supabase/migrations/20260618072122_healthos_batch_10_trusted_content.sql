-- HealthOS Backend Batch 10: Trusted Content + Saved/Sourced Articles Backend
-- Draft-only migration. Do not apply remotely from Codex.

create extension if not exists pgcrypto;

create table if not exists public.trusted_content_sources (
  id uuid primary key default gen_random_uuid(),
  source_name text not null,
  source_url text,
  publisher_name text,
  source_quality text not null default 'unknown',
  country_code text,
  language_code text,
  medical_review_process text,
  description text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint trusted_content_sources_quality_check check (
    source_quality in (
      'official_health_authority',
      'clinical_institution',
      'peer_reviewed',
      'registered_professional',
      'trusted_publisher',
      'manufacturer',
      'community',
      'user_saved',
      'ai_generated',
      'unknown'
    )
  ),
  constraint trusted_content_sources_status_check check (status in ('active', 'needs_review', 'archived', 'blocked'))
);

create table if not exists public.trusted_content_items (
  id uuid primary key default gen_random_uuid(),
  source_id uuid references public.trusted_content_sources(id) on delete set null,
  title text not null,
  summary text,
  content_type text not null default 'article',
  category text not null default 'general_health',
  primary_realm text not null default 'health',
  source_url text,
  image_url text,
  author_name text,
  publisher_name text,
  language_code text,
  country_code text,
  reviewed_at date,
  published_at date,
  retrieved_at timestamptz,
  source_quality text not null default 'unknown',
  medical_review_status text not null default 'unknown',
  ai_summary_status text not null default 'not_ai',
  safety_disclaimer text,
  tags text[] not null default '{}'::text[],
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  constraint trusted_content_items_source_quality_check check (
    source_quality in (
      'official_health_authority',
      'clinical_institution',
      'peer_reviewed',
      'registered_professional',
      'trusted_publisher',
      'manufacturer',
      'community',
      'user_saved',
      'ai_generated',
      'unknown'
    )
  ),
  constraint trusted_content_items_status_check check (status in ('draft', 'published', 'active', 'needs_review', 'archived', 'blocked')),
  constraint trusted_content_items_ai_status_check check (ai_summary_status in ('not_ai', 'ai_summary_needs_review', 'ai_summary_reviewed', 'ai_generated_untrusted', 'unknown'))
);

create table if not exists public.trusted_content_targeting (
  id uuid primary key default gen_random_uuid(),
  content_item_id uuid not null references public.trusted_content_items(id) on delete cascade,
  target_realm text not null,
  target_context text,
  priority integer not null default 0,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint trusted_content_targeting_status_check check (status in ('active', 'archived'))
);

create table if not exists public.saved_content_items (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  content_item_id uuid references public.trusted_content_items(id) on delete cascade,
  external_title text,
  external_url text,
  external_image_url text,
  save_type text not null default 'saved',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  constraint saved_content_items_save_type_check check (save_type in ('saved', 'read_later', 'favorite', 'user_link', 'dismissed', 'hidden', 'unknown'))
);

create table if not exists public.content_read_history (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  content_item_id uuid references public.trusted_content_items(id) on delete set null,
  external_url text,
  opened_at timestamptz not null default now(),
  source_realm text,
  created_at timestamptz not null default now()
);

create table if not exists public.content_feedback (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  content_item_id uuid not null references public.trusted_content_items(id) on delete cascade,
  feedback_type text not null,
  note text,
  created_at timestamptz not null default now(),
  constraint content_feedback_type_check check (feedback_type in ('helpful', 'not_relevant', 'outdated', 'hard_to_understand', 'reported', 'saved_by_mistake', 'unknown'))
);

comment on table public.trusted_content_sources is 'Curated source metadata for educational content. Client writes are intentionally deferred until a content admin model exists.';
comment on table public.trusted_content_items is 'Metadata and short summaries only. Do not store copied full external article bodies.';
comment on table public.saved_content_items is 'Private per-user saved/read-later content and user-saved external links. User links are not official trusted sources.';
comment on column public.trusted_content_items.ai_summary_status is 'AI summaries must be explicitly labeled and are not trusted medical content by default.';

create index if not exists trusted_content_sources_status_quality_idx on public.trusted_content_sources(status, source_quality);
create index if not exists trusted_content_items_status_realm_idx on public.trusted_content_items(status, primary_realm);
create index if not exists trusted_content_items_category_idx on public.trusted_content_items(category);
create index if not exists trusted_content_items_source_quality_idx on public.trusted_content_items(source_quality);
create index if not exists trusted_content_items_published_idx on public.trusted_content_items(published_at desc);
create index if not exists trusted_content_items_tags_idx on public.trusted_content_items using gin(tags);
create index if not exists trusted_content_targeting_item_idx on public.trusted_content_targeting(content_item_id);
create index if not exists trusted_content_targeting_realm_idx on public.trusted_content_targeting(target_realm, status, priority desc);
create index if not exists saved_content_items_owner_idx on public.saved_content_items(owner_user_id, archived_at, created_at desc);
create index if not exists saved_content_items_content_idx on public.saved_content_items(content_item_id);
create index if not exists content_read_history_owner_idx on public.content_read_history(owner_user_id, opened_at desc);
create index if not exists content_feedback_owner_idx on public.content_feedback(owner_user_id, created_at desc);
create index if not exists content_feedback_content_idx on public.content_feedback(content_item_id);

alter table public.trusted_content_sources enable row level security;
alter table public.trusted_content_items enable row level security;
alter table public.trusted_content_targeting enable row level security;
alter table public.saved_content_items enable row level security;
alter table public.content_read_history enable row level security;
alter table public.content_feedback enable row level security;

grant select on public.trusted_content_sources to authenticated;
grant select on public.trusted_content_items to authenticated;
grant select on public.trusted_content_targeting to authenticated;
grant select, insert, update, delete on public.saved_content_items to authenticated;
grant select, insert on public.content_read_history to authenticated;
grant select, insert on public.content_feedback to authenticated;

drop policy if exists "trusted_content_sources_active_read" on public.trusted_content_sources;
create policy "trusted_content_sources_active_read"
  on public.trusted_content_sources
  for select
  to authenticated
  using (status = 'active');

drop policy if exists "trusted_content_items_published_read" on public.trusted_content_items;
create policy "trusted_content_items_published_read"
  on public.trusted_content_items
  for select
  to authenticated
  using (status in ('published', 'active'));

drop policy if exists "trusted_content_targeting_active_read" on public.trusted_content_targeting;
create policy "trusted_content_targeting_active_read"
  on public.trusted_content_targeting
  for select
  to authenticated
  using (
    status = 'active'
    and exists (
      select 1 from public.trusted_content_items item
      where item.id = trusted_content_targeting.content_item_id
      and item.status in ('published', 'active')
    )
  );

drop policy if exists "saved_content_items_owner_manage" on public.saved_content_items;
create policy "saved_content_items_owner_manage"
  on public.saved_content_items
  for all
  to authenticated
  using ((select auth.uid()) = owner_user_id)
  with check ((select auth.uid()) = owner_user_id);

drop policy if exists "content_read_history_owner_select" on public.content_read_history;
create policy "content_read_history_owner_select"
  on public.content_read_history
  for select
  to authenticated
  using ((select auth.uid()) = owner_user_id);

drop policy if exists "content_read_history_owner_insert" on public.content_read_history;
create policy "content_read_history_owner_insert"
  on public.content_read_history
  for insert
  to authenticated
  with check ((select auth.uid()) = owner_user_id);

drop policy if exists "content_feedback_owner_select" on public.content_feedback;
create policy "content_feedback_owner_select"
  on public.content_feedback
  for select
  to authenticated
  using ((select auth.uid()) = owner_user_id);

drop policy if exists "content_feedback_owner_insert" on public.content_feedback;
create policy "content_feedback_owner_insert"
  on public.content_feedback
  for insert
  to authenticated
  with check ((select auth.uid()) = owner_user_id);

drop trigger if exists set_trusted_content_sources_updated_at on public.trusted_content_sources;
create trigger set_trusted_content_sources_updated_at
  before update on public.trusted_content_sources
  for each row execute function public.set_updated_at();

drop trigger if exists set_trusted_content_items_updated_at on public.trusted_content_items;
create trigger set_trusted_content_items_updated_at
  before update on public.trusted_content_items
  for each row execute function public.set_updated_at();

drop trigger if exists set_trusted_content_targeting_updated_at on public.trusted_content_targeting;
create trigger set_trusted_content_targeting_updated_at
  before update on public.trusted_content_targeting
  for each row execute function public.set_updated_at();

drop trigger if exists set_saved_content_items_updated_at on public.saved_content_items;
create trigger set_saved_content_items_updated_at
  before update on public.saved_content_items
  for each row execute function public.set_updated_at();
