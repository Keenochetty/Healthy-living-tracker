-- HealthOS Phase 23 draft migration.
-- Scope: enable RLS for unambiguous public-reference/config tables created by
-- the fitness AI import support migration. These tables do not contain user
-- health data; writes remain server/admin-managed because no public insert,
-- update, or delete grants are added here.

alter table if exists public.fitness_calendar_activation_rules enable row level security;
alter table if exists public.fitness_history_event_taxonomy enable row level security;
alter table if exists public.fitness_source_references enable row level security;
alter table if exists public.fitness_muscle_map_layers enable row level security;
alter table if exists public.ai_import_workflow_config enable row level security;

drop policy if exists "Authenticated users can read fitness calendar activation rules"
  on public.fitness_calendar_activation_rules;
create policy "Authenticated users can read fitness calendar activation rules"
on public.fitness_calendar_activation_rules
for select
to authenticated
using (true);

drop policy if exists "Authenticated users can read fitness history event taxonomy"
  on public.fitness_history_event_taxonomy;
create policy "Authenticated users can read fitness history event taxonomy"
on public.fitness_history_event_taxonomy
for select
to authenticated
using (true);

drop policy if exists "Authenticated users can read fitness source references"
  on public.fitness_source_references;
create policy "Authenticated users can read fitness source references"
on public.fitness_source_references
for select
to authenticated
using (true);

drop policy if exists "Authenticated users can read fitness muscle map layers"
  on public.fitness_muscle_map_layers;
create policy "Authenticated users can read fitness muscle map layers"
on public.fitness_muscle_map_layers
for select
to authenticated
using (true);

drop policy if exists "Authenticated users can read AI import workflow config"
  on public.ai_import_workflow_config;
create policy "Authenticated users can read AI import workflow config"
on public.ai_import_workflow_config
for select
to authenticated
using (true);
