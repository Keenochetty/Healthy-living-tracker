# HealthOS Schema Normalization Phase 24

Date: 2026-06-17

## Scope

This pass aligned the HealthOS Supabase data model at the documentation and static-helper level. It did not change remote Supabase state, run migrations, deploy functions, remove routes, or alter auth/storage/business behavior.

## Files Inspected

- `src/types/database.ts`
- `src/lib/aiBackend.ts`
- `src/lib/accountData.ts`
- `src/lib/appAIStorage.ts`
- `src/features/ai/aiHistoryService.ts`
- `src/services/fitnessPlanActivationService.ts`
- `src/services/fitnessAiImportService.ts`
- `src/services/fitnessContentService.ts`
- `src/services/fitnessMuscleMapService.ts`
- `src/services/storage/privateFileService.ts`
- Supabase migrations under `supabase/migrations`
- Edge functions under `supabase/functions`

## Files Created

- `src/features/healthosDataModel/tablePrivacyClasses.ts`
- `src/features/healthosDataModel/tableRegistry.ts`
- `src/features/healthosDataModel/realmDataContracts.ts`
- `src/features/healthosDataModel/modelAliases.ts`
- `src/features/healthosDataModel/backendReadiness.ts`
- `src/features/healthosDataModel/migrationBacklog.ts`
- `src/features/healthosDataModel/index.ts`
- `docs/style-sheets/HEALTHOS_STYLE_SHEET_24_SCHEMA_NORMALIZATION_DATA_MODEL.md`
- `docs/HEALTHOS_REALM_TABLE_MAP.md`
- `docs/HEALTHOS_DATA_MODEL_ALIGNMENT_MAP.md`
- `docs/HEALTHOS_SCHEMA_GAP_REPORT.md`
- `docs/HEALTHOS_MIGRATION_BACKLOG.md`
- `docs/HEALTHOS_MVP_BACKEND_SCOPE.md`
- `docs/HEALTHOS_DATABASE_TYPES_AUDIT.md`
- `docs/HEALTHOS_CANONICAL_MODEL_DECISIONS.md`

## Migration Inspection

Migrations contain account/profile, family, records, calendar, AI, fitness import, child/caregiver, medication, notifications, and settings foundations.

Missing or incomplete areas are documented in the schema gap report and migration backlog.

No Phase 24 migration draft was created because the safe output for this phase is normalization and backlog. Several schema additions depend on naming, ownership, and RLS decisions.

## Generated Database Types

No generated Supabase `database.types.ts` file was found. The repo has a handwritten `src/types/database.ts` with a narrow set of profile-related row types.

## Tables Grouped

Tables were grouped into:

- Account/profile/settings.
- Family/permissions.
- Child/caregiver.
- Records/files.
- Calendar/reminders/notifications.
- AI/import.
- Fitness.
- Missing realm schemas.

## Profile / Person / Child / Caregiver Status

- Account profile is usable but overlaps with future care-subject modeling.
- Child identity exists through `children`.
- Caregiver identity and assignment exist through `caregiver_profiles` and `caregiver_child_access`.
- Person/care-subject normalization is deferred because it could become destructive without a backfill plan.

## Family Permissions

`sharing_permissions` exists but needs final shape and enforcement decisions before sensitive medical data should rely on explicit per-module sharing. Broad family membership remains too coarse for some health data.

## Records Linking

Records need additive `record_files` and `record_links` tables. Current records and documents are split across several legacy and canonical tables.

## AI Import Persistence

AI persistence exists through app and HealthSync-specific tables, but canonical import envelope naming is still not unified. The accepted behavior remains review-first: AI drafts should not save directly into health records.

## Reminder Source Model

`reminders` exists, but source ownership needs nullable source columns and `reminder_history` before reminders can be reliably traced to medication, supplements, calendar, pregnancy, baby/child, records, or AI imports.

## Trusted Content Separation

Trusted content should separate public reference/source tables from user-private saved content. Those tables are currently missing from migrations.

## Backend Readiness

- Ready: Auth.
- Partial: Home, Calendar, Scan, Health, Family, AI, Fitness, Medication, Baby/Child, Caregiver, Profile, Settings, Onboarding, Notifications, Reminders.
- Schema missing: Nutrition/Food, Supplements, Pregnancy, Women's Health/Cycle, Trusted Content.
- Storage missing: Records.
- UI only: Elder, Device Sync, Biometrics.

## Risks And Blockers

- Generated database types are missing.
- Several active services reference tables not found in migrations.
- Records and private storage need canonicalization before full release.
- Nutrition, pregnancy, cycle, supplement, and trusted content persistence are not MVP-ready unless scoped down.
- Family medical sharing needs explicit permission enforcement before release.

## Verification

- `npm run typecheck` passed on 2026-06-17.
- No full build/export was run.
- No packages were installed.
- No remote Supabase commands were run.

## Next Phase

Use the migration backlog to create small additive migrations in priority order, starting with records, reminder source fields, fitness reference tables, and the realm schemas that will remain visible for MVP.
