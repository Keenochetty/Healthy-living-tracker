# HealthOS Step 36 - Supabase Types + Service Wiring Cleanup

Date: 2026-06-18

## Scope

This step audited and cleaned the backend/service typing foundation only. No migrations, remote Supabase commands, type generation, feature additions, package installs, UI redesigns, fake data, seed data, Edge Function deploys, or full build/export commands were run.

## Files Inspected

- Step request attachments for HealthOS Style Sheet 36.
- Supabase client/type files: `src/lib/supabase.ts`, `src/types/database.ts`, expected generated type locations.
- Shared backend utilities under `src/features/backend`.
- Feature service folders: `account`, `careProfiles`, `familySharing`, `records`, `calendarReminders`, `medicationSafety`, `lifeStageHealth`, `aiImport`, `fitnessNutrition`, `trustedContent`.
- Legacy/service areas under `src/lib`, `src/services`, and route/component imports discovered through `.from()` and service import searches.
- Previous backend docs for Phases 26-35, schema gap, realm table map, data model alignment, and migration sequence where present.

## Generated Supabase Types

No full generated Supabase `Database` type file was found.

Actual local type file found:

- `src/types/database.ts` - manual profile-focused types only.

Tables present in generated types:

- None confirmed.

Tables missing from generated types:

- All planned MVP backend tables across Batches 1-10.

See `docs/HEALTHOS_SUPABASE_GENERATED_TYPES_COVERAGE.md`.

## Canonical Supabase Client

Canonical client:

- `src/lib/supabase.ts`

Shared re-export:

- `src/features/backend/supabaseClient.ts`

No duplicate frontend Supabase client was created. No service-role key or private secret was added to client code.

## Files Created

- `src/features/backend/backendTypes.ts`
- `src/features/backend/backendResult.ts`
- `src/features/backend/backendErrors.ts`
- `src/features/backend/tableRegistry.ts`
- `src/features/backend/tableAvailability.ts`
- `src/features/backend/supabaseClient.ts`
- `src/features/backend/serviceGuards.ts`
- `src/features/backend/index.ts`
- `docs/style-sheets/HEALTHOS_STYLE_SHEET_36_SUPABASE_TYPES_SERVICE_WIRING_CLEANUP.md`
- `docs/HEALTHOS_SUPABASE_GENERATED_TYPES_COVERAGE.md`
- `docs/HEALTHOS_BACKEND_TABLE_REGISTRY.md`
- `docs/HEALTHOS_SERVICE_RESULT_STANDARD.md`
- `docs/HEALTHOS_FEATURE_SERVICE_EXPORTS_AUDIT.md`
- `docs/HEALTHOS_ROUTE_SERVICE_WIRING_AUDIT.md`
- `docs/HEALTHOS_MISSING_TABLES_AND_DEFERRED_SERVICES.md`
- `docs/HEALTHOS_DUPLICATE_SERVICE_CLEANUP.md`
- `docs/HEALTHOS_TYPES_REGENERATION_TODO.md`
- `docs/HEALTHOS_TYPECHECK_FIX_LOG.md`

## Files Updated

- `src/features/backend/tableRegistry.ts`
- `docs/HEALTHOS_TYPECHECK_FIX_LOG.md`
- `docs/HEALTHOS_STEP_36_SUPABASE_TYPES_SERVICE_WIRING_CLEANUP.md`

## Shared Backend Utility Status

Shared backend primitives now exist under `src/features/backend`:

- shared backend status/risk/service-area/table-registry types
- shared result helpers
- privacy-safe backend error helpers
- planned table registry
- table availability helpers
- canonical Supabase client re-export
- service guards for auth, generated table availability, review-first import, owner-scoped writes, safe copy, permission errors, and missing table errors

## Table Registry Status

All planned MVP tables from Batches 1-10 are registered. Because generated types are absent, every table is marked `generatedTypeStatus: "missing"`.

## Service Result Standard Status

The shared service result standard is documented and implemented. Existing feature-specific result shapes were not aggressively rewritten because active UI may already rely on them.

## Missing-Table / Deferred Handling Status

Shared helpers can now report missing generated types or missing table availability before unsafe backend work. Broad service rewrites were deferred where they would require route behavior changes or generated type availability.

## Feature Export Cleanup Status

Feature indexes exist for inspected feature folders. No feature index deletion or broad export rewrite was performed. The new shared backend utilities are exported from `src/features/backend/index.ts`.

## Duplicate Service Cleanup Status

Duplicate legacy services remain documented. They were not deleted because active routes/components still import them.

## Route / Service Wiring Status

Route wiring remains mostly deferred. Generated types are missing, so broad active-route rewiring to newly drafted feature services would be unsafe in this step.

## Services Still Unsafe Or Deferred

Services that target planned backend tables remain dependent on migration application and generated types. Known areas include account preferences, care profiles, family sharing, records, calendar/reminders, medication/supplements, life-stage health, AI import, fitness/nutrition, trusted content, legacy storage modules, and legacy fitness/nutrition/reminder services.

## Typecheck Result

Passed.

Command:

```bash
npm run typecheck
```

Output summary:

```txt
tsc --noEmit
```

## Typecheck Errors Fixed

None. Typecheck passed on the first run.

## Remaining TypeScript Blockers

None found by `npm run typecheck`.

## Risks / Blockers

- No generated Supabase `Database` type file exists.
- Planned migrations were not applied in this step by instruction.
- Services still rely on domain types, dynamic table names, or table-name casts for planned tables.
- Active routes still use legacy local storage/service modules in many areas.
- Route rewiring requires feature-by-feature QA after generated types exist.

## Next Recommended Step

Apply/verify backend migrations in the intended Supabase environment, regenerate Supabase types into a dedicated generated type file, update the table registry from generated coverage, then migrate route wiring feature by feature.
