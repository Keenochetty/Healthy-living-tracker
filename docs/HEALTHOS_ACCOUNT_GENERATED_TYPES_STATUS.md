# HealthOS Account Generated Types Status

Date: 2026-06-17

## Status

No generated Supabase `database.types.ts` file was found.

Existing handwritten database types live in `src/types/database.ts` and cover:

- `ProfileRow`
- `ProfileSettingsRow`
- `ProfileModuleRow`
- `ProfileWidgetRow`

The new Batch 1 draft tables are not represented in generated types.

## Impact

Account services use local domain types and tolerant mappers. Strict generated table row/insert/update types must be added after the Batch 1 migration is applied and types are regenerated.

## Deferred Command

No Supabase type generation command was run in this phase.

