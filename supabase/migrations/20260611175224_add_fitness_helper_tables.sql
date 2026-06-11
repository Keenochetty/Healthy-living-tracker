create table if not exists fitness_calendar_activation_rules (
  rule_id text primary key,
  title text not null,
  rule text,
  data_fields text
);

create table if not exists fitness_history_event_taxonomy (
  history_event_type_id text primary key,
  event_key text not null,
  description text,
  recommended_payload_fields text
);

create table if not exists fitness_source_references (
  source_id text primary key,
  name text not null,
  purpose text,
  url text,
  license_note text
);

create table if not exists fitness_muscle_map_layers (
  layer_id text primary key,
  display_name text not null,
  view text,
  recommended_asset_png text,
  heatmap_supported boolean default true,
  notes text
);

create table if not exists ai_import_workflow_config (
  id text primary key,
  config jsonb not null,
  created_at timestamptz default now()
);
