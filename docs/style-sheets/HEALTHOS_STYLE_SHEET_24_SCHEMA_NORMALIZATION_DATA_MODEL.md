# HealthOS Style Sheet 24 - Supabase Schema Normalization + Data Model Alignment

## Purpose

Define the HealthOS backend data model direction without destructive database changes. This pass maps active routes, realms, Supabase tables, storage buckets, edge functions, AI import targets, record links, reminder ownership, privacy classes, and missing schema work.

## Rules

- Do not redesign UI.
- Do not remove routes or features.
- Do not change Supabase auth, storage, edge function, or migration behavior.
- Do not run remote Supabase commands.
- Do not create destructive migrations.
- Prefer additive future migrations and document destructive decisions separately.
- Run typecheck only.

## Required Outputs

- Realm-to-table map.
- Data model alignment map.
- Schema gap report.
- Migration backlog.
- MVP backend scope.
- Database type audit.
- Canonical model decisions.
- Static helper registry under `src/features/healthosDataModel`.

