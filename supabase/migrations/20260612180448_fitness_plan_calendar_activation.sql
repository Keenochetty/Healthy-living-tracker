-- Older installations created calendar_events with family-only required fields.
-- The current calendar supports personal/profile-routed events, so keep the
-- compatibility columns but allow profile-owned events without a family.
alter table public.calendar_events
  alter column family_id drop not null;

create table if not exists public.user_imported_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  profile_id uuid references public.profiles(id) on delete set null,
  source_program_id text not null,
  title text not null,
  status text not null default 'active' check (status in ('active', 'inactive', 'cancelled', 'archived')),
  start_date date not null,
  workout_time time not null,
  reminder_minutes integer not null default 30 check (reminder_minutes >= 0),
  workout_weekdays integer[] not null default array[1, 3, 5],
  rest_day_handling text not null default 'skip',
  calendar_color text,
  activated_at timestamptz not null default now(),
  deactivated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_imported_plan_days (
  id uuid primary key default gen_random_uuid(),
  imported_plan_id uuid not null references public.user_imported_plans(id) on delete cascade,
  source_day_number integer not null,
  scheduled_for timestamptz not null,
  focus text not null,
  exercises text[] not null default '{}',
  estimated_minutes integer not null default 30,
  safety_note text,
  completion_status text not null default 'planned' check (completion_status in ('planned', 'completed', 'skipped', 'cancelled')),
  created_at timestamptz not null default now()
);

create table if not exists public.user_plan_calendar_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  imported_plan_id uuid not null references public.user_imported_plans(id) on delete cascade,
  imported_plan_day_id uuid not null references public.user_imported_plan_days(id) on delete cascade,
  calendar_event_id uuid not null references public.calendar_events(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(imported_plan_day_id, calendar_event_id)
);

create table if not exists public.user_fitness_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  profile_id uuid references public.profiles(id) on delete set null,
  event_type text not null,
  source_program_id text,
  imported_plan_id uuid references public.user_imported_plans(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now()
);

alter table public.user_imported_plans drop constraint if exists user_imported_plans_status_check;
alter table public.user_imported_plans
  add constraint user_imported_plans_status_check
  check (status in ('draft', 'active', 'inactive', 'cancelled', 'archived'));

alter table public.user_imported_plans
  add column if not exists description text,
  add column if not exists source_title text,
  add column if not exists source_url text,
  add column if not exists source_domain text,
  add column if not exists source_license_note text,
  add column if not exists original_search_query text,
  add column if not exists normalized_plan_json jsonb,
  add column if not exists safety_flags jsonb not null default '[]'::jsonb,
  add column if not exists import_status text default 'manual',
  add column if not exists ai_confidence numeric,
  add column if not exists review_required boolean not null default false,
  add column if not exists user_editable boolean not null default true,
  add column if not exists plan_type text,
  add column if not exists audience text,
  add column if not exists difficulty text,
  add column if not exists equipment text[],
  add column if not exists diet_style text,
  add column if not exists goal text,
  add column if not exists notes text,
  add column if not exists intensity text;

alter table public.user_imported_plan_days
  add column if not exists title text,
  add column if not exists exercise_details jsonb not null default '[]'::jsonb,
  add column if not exists meals jsonb not null default '[]'::jsonb,
  add column if not exists notes text;

create table if not exists public.ai_plan_search_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  profile_id uuid references public.profiles(id) on delete set null,
  query text not null,
  context jsonb not null default '{}'::jsonb,
  result_count integer not null default 0,
  backend_configured boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.user_fitness_history
  add column if not exists title text,
  add column if not exists description text,
  add column if not exists related_plan_id uuid references public.user_imported_plans(id) on delete set null,
  add column if not exists related_program_id text,
  add column if not exists related_exercise_id text,
  add column if not exists related_calendar_event_id uuid references public.calendar_events(id) on delete set null,
  add column if not exists created_at timestamptz not null default now();

create index if not exists user_imported_plans_user_status_idx
  on public.user_imported_plans(user_id, status);
create index if not exists user_imported_plan_days_plan_scheduled_idx
  on public.user_imported_plan_days(imported_plan_id, scheduled_for);
create index if not exists user_plan_calendar_events_plan_idx
  on public.user_plan_calendar_events(imported_plan_id);
create index if not exists user_plan_calendar_events_calendar_idx
  on public.user_plan_calendar_events(calendar_event_id);
create index if not exists user_fitness_history_user_occurred_idx
  on public.user_fitness_history(user_id, occurred_at desc);
create index if not exists user_fitness_history_plan_idx
  on public.user_fitness_history(related_plan_id);
create index if not exists user_fitness_history_calendar_idx
  on public.user_fitness_history(related_calendar_event_id);
create index if not exists ai_plan_search_logs_user_created_idx
  on public.ai_plan_search_logs(user_id, created_at desc);

alter table public.user_imported_plans enable row level security;
alter table public.user_imported_plan_days enable row level security;
alter table public.user_plan_calendar_events enable row level security;
alter table public.user_fitness_history enable row level security;
alter table public.ai_plan_search_logs enable row level security;

drop trigger if exists user_imported_plans_set_updated_at on public.user_imported_plans;
create trigger user_imported_plans_set_updated_at
before update on public.user_imported_plans
for each row execute function public.set_updated_at();

grant select, insert, update, delete on
  public.user_imported_plans,
  public.user_imported_plan_days,
  public.user_plan_calendar_events
to authenticated;

grant select, insert on public.user_fitness_history to authenticated;
grant select, insert on public.ai_plan_search_logs to authenticated;

drop policy if exists "Users manage own imported fitness plans" on public.user_imported_plans;
create policy "Users manage own imported fitness plans"
on public.user_imported_plans for all
to authenticated
using (user_id = (select auth.uid()))
with check (
  user_id = (select auth.uid())
  and (profile_id is null or profile_id = (select auth.uid()))
);

drop policy if exists "Users read own imported plan days" on public.user_imported_plan_days;
create policy "Users read own imported plan days"
on public.user_imported_plan_days for select
to authenticated
using (
  exists (
    select 1 from public.user_imported_plans plan
    where plan.id = user_imported_plan_days.imported_plan_id
      and plan.user_id = (select auth.uid())
  )
);

drop policy if exists "Users insert own imported plan days" on public.user_imported_plan_days;
create policy "Users insert own imported plan days"
on public.user_imported_plan_days for insert
to authenticated
with check (
  exists (
    select 1 from public.user_imported_plans plan
    where plan.id = user_imported_plan_days.imported_plan_id
      and plan.user_id = (select auth.uid())
  )
);

drop policy if exists "Users update own imported plan days" on public.user_imported_plan_days;
create policy "Users update own imported plan days"
on public.user_imported_plan_days for update
to authenticated
using (
  exists (
    select 1 from public.user_imported_plans plan
    where plan.id = user_imported_plan_days.imported_plan_id
      and plan.user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1 from public.user_imported_plans plan
    where plan.id = user_imported_plan_days.imported_plan_id
      and plan.user_id = (select auth.uid())
  )
);

drop policy if exists "Users delete own imported plan days" on public.user_imported_plan_days;
create policy "Users delete own imported plan days"
on public.user_imported_plan_days for delete
to authenticated
using (
  exists (
    select 1 from public.user_imported_plans plan
    where plan.id = user_imported_plan_days.imported_plan_id
      and plan.user_id = (select auth.uid())
  )
);

drop policy if exists "Users manage own plan calendar links" on public.user_plan_calendar_events;
create policy "Users manage own plan calendar links"
on public.user_plan_calendar_events for all
to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

drop policy if exists "Users read own fitness history" on public.user_fitness_history;
create policy "Users read own fitness history"
on public.user_fitness_history for select
to authenticated
using (user_id = (select auth.uid()));

drop policy if exists "Users insert own fitness history" on public.user_fitness_history;
create policy "Users insert own fitness history"
on public.user_fitness_history for insert
to authenticated
with check (
  user_id = (select auth.uid())
  and (profile_id is null or profile_id = (select auth.uid()))
);

drop policy if exists "Users read own AI plan search logs" on public.ai_plan_search_logs;
create policy "Users read own AI plan search logs"
on public.ai_plan_search_logs for select
to authenticated
using (user_id = (select auth.uid()));

drop policy if exists "Users insert own AI plan search logs" on public.ai_plan_search_logs;
create policy "Users insert own AI plan search logs"
on public.ai_plan_search_logs for insert
to authenticated
with check (
  user_id = (select auth.uid())
  and (profile_id is null or profile_id = (select auth.uid()))
);

drop policy if exists "Creators can delete own calendar events" on public.calendar_events;
create policy "Creators can delete own calendar events"
on public.calendar_events for delete
to authenticated
using (created_by = (select auth.uid()));
