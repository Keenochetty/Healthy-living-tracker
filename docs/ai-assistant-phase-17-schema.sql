-- Phase 17 AI Assistant + Safety Guardrails schema draft.
-- Documentation only: do not apply this file as a migration in Phase 17.
-- AI calls should run through server-side Edge Functions with task-scoped data,
-- safety checks, source filtering, and audit metadata. Do not send private
-- health data directly from a frontend client to an external AI provider.

create table if not exists public.assistant_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  profile_id uuid not null,
  assistant_enabled boolean not null default false,
  quick_logging_enabled boolean not null default false,
  conversation_history_enabled boolean not null default false,
  allowed_data_categories_json jsonb not null default '[]'::jsonb,
  sensitive_category_consent_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.assistant_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  profile_id uuid not null,
  title text not null,
  mode text not null,
  is_deleted boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.assistant_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  profile_id uuid not null,
  conversation_id uuid not null,
  role text not null,
  content_summary text,
  content_encrypted text,
  mode text not null,
  risk_category text not null,
  created_at timestamptz not null default now(),
  constraint assistant_messages_role_check
    check (role in ('user', 'assistant', 'system'))
);

create table if not exists public.assistant_drafts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  profile_id uuid not null,
  mode text not null,
  action_type text not null,
  target_realm text not null,
  draft_payload_json jsonb not null default '{}'::jsonb,
  status text not null default 'draft',
  confirmed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint assistant_drafts_status_check
    check (status in ('draft', 'confirmed', 'cancelled', 'edited'))
);

create table if not exists public.assistant_audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  profile_id uuid not null,
  assistant_mode text not null,
  action_type text not null,
  data_categories_accessed_json jsonb not null default '[]'::jsonb,
  related_record_ids_json jsonb not null default '[]'::jsonb,
  created_draft_ids_json jsonb not null default '[]'::jsonb,
  confirmed_by_user boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.assistant_source_cards (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  source_organization text not null,
  source_url text not null,
  reviewed_date date,
  last_checked_date date,
  summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists assistant_settings_user_profile_idx
  on public.assistant_settings (user_id, profile_id);
create index if not exists assistant_conversations_user_profile_idx
  on public.assistant_conversations (user_id, profile_id, updated_at desc);
create index if not exists assistant_messages_conversation_idx
  on public.assistant_messages (user_id, profile_id, conversation_id, created_at);
create index if not exists assistant_drafts_user_profile_status_idx
  on public.assistant_drafts (user_id, profile_id, status, updated_at desc);
create index if not exists assistant_audit_logs_user_profile_idx
  on public.assistant_audit_logs (user_id, profile_id, created_at desc);
create index if not exists assistant_source_cards_source_idx
  on public.assistant_source_cards (source_organization, last_checked_date desc);

alter table public.assistant_settings enable row level security;
alter table public.assistant_conversations enable row level security;
alter table public.assistant_messages enable row level security;
alter table public.assistant_drafts enable row level security;
alter table public.assistant_audit_logs enable row level security;
alter table public.assistant_source_cards enable row level security;

create policy "Users can read their assistant settings"
  on public.assistant_settings for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can insert their assistant settings"
  on public.assistant_settings for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their assistant settings"
  on public.assistant_settings for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can read their assistant drafts"
  on public.assistant_drafts for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can insert their assistant drafts"
  on public.assistant_drafts for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their assistant drafts"
  on public.assistant_drafts for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can read their assistant audit logs"
  on public.assistant_audit_logs for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can insert their assistant audit logs"
  on public.assistant_audit_logs for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

-- Repeat the same owner-scoped pattern for assistant_conversations and
-- assistant_messages. Shared profile access should require explicit
-- profile_permissions predicates and must not rely on `to authenticated` alone.

create policy "Authenticated users can read assistant source cards"
  on public.assistant_source_cards for select
  to authenticated
  using (true);

-- Data API grant notes for projects where new public tables are not exposed
-- automatically:
-- grant usage on schema public to authenticated;
-- grant select, insert, update, delete on public.assistant_settings to authenticated;
-- grant select, insert, update, delete on public.assistant_conversations to authenticated;
-- grant select, insert, update, delete on public.assistant_messages to authenticated;
-- grant select, insert, update, delete on public.assistant_drafts to authenticated;
-- grant select, insert on public.assistant_audit_logs to authenticated;
-- grant select on public.assistant_source_cards to authenticated;
