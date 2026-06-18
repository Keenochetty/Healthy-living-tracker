# HealthOS MVP Backend Implementation Plan Phase 25

Date: 2026-06-17

## Scope

This phase turns Phase 23 and Phase 24 backend audits into an ordered implementation plan. It does not redesign UI, apply migrations, deploy functions, add packages, add seed data, or connect new backend writes.

## Files Inspected

- Phase 23 and Phase 24 backend audit docs.
- `supabase/migrations`
- `supabase/functions`
- `supabase/config.toml` and `supabase/seed.sql` status from local tree inspection.
- `src/lib/supabase.ts`
- `src/services`
- `src/features`
- `src/hooks`
- `src/types`
- `.env.example`
- `package.json`

## Phase 23 / 24 Docs

Found:

- `docs/HEALTHOS_SUPABASE_RLS_DATA_PRIVACY_PHASE_23.md`
- `docs/HEALTHOS_RLS_POLICY_AUDIT.md`
- `docs/HEALTHOS_STORAGE_POLICY_AUDIT.md`
- `docs/HEALTHOS_DATA_PRIVACY_MODEL.md`
- `docs/HEALTHOS_EXPORT_DELETE_READINESS.md`
- `docs/HEALTHOS_SCHEMA_NORMALIZATION_PHASE_24.md`
- `docs/HEALTHOS_REALM_TABLE_MAP.md`
- `docs/HEALTHOS_DATA_MODEL_ALIGNMENT_MAP.md`
- `docs/HEALTHOS_SCHEMA_GAP_REPORT.md`
- `docs/HEALTHOS_MIGRATION_BACKLOG.md`
- `docs/HEALTHOS_MVP_BACKEND_SCOPE.md`
- `docs/HEALTHOS_DATABASE_TYPES_AUDIT.md`
- `docs/HEALTHOS_CANONICAL_MODEL_DECISIONS.md`

No required Phase 23/24 source doc was missing.

## Files Created

- `src/features/backendPlan/backendPhases.ts`
- `src/features/backendPlan/migrationSequence.ts`
- `src/features/backendPlan/serviceSequence.ts`
- `src/features/backendPlan/uiConnectionSequence.ts`
- `src/features/backendPlan/releaseBlockers.ts`
- `src/features/backendPlan/afterMvpScope.ts`
- `src/features/backendPlan/index.ts`
- `docs/style-sheets/HEALTHOS_STYLE_SHEET_25_MVP_BACKEND_IMPLEMENTATION_PLAN.md`
- `docs/HEALTHOS_BACKEND_MIGRATION_SEQUENCE.md`
- `docs/HEALTHOS_BACKEND_SERVICE_SEQUENCE.md`
- `docs/HEALTHOS_UI_BACKEND_CONNECTION_SEQUENCE.md`
- `docs/HEALTHOS_MVP_RELEASE_BLOCKERS.md`
- `docs/HEALTHOS_AFTER_MVP_BACKEND_SCOPE.md`
- `docs/HEALTHOS_SUPABASE_TYPE_GENERATION_PLAN.md`
- `docs/HEALTHOS_RLS_IMPLEMENTATION_SEQUENCE.md`
- `docs/HEALTHOS_STORAGE_IMPLEMENTATION_SEQUENCE.md`
- `docs/HEALTHOS_BACKEND_IMPLEMENTATION_DECISIONS.md`
- `docs/HEALTHOS_MVP_BACKEND_IMPLEMENTATION_PLAN_PHASE_25.md`

## Files Updated

- `src/components/healthos/calendar/HealthOSCalendarEventRow.tsx`
- `src/components/healthos/family/useHealthOSFamilyActions.ts`
- `src/components/healthos/health/HealthOSVitalsOverviewSection.tsx`
- `src/components/healthos/home/HealthOSPrimaryAttentionCard.tsx`

These updates only narrow navigation/accessibility expressions that caused TypeScript union expansion errors. Runtime navigation behavior was not changed.

## Backend Priorities

1. Account/preferences.
2. Care subject profiles.
3. Family permissions.
4. Records/storage.
5. Calendar/reminders.
6. Medication/supplements.
7. Life-stage health.
8. AI import review.
9. Fitness/nutrition.
10. Trusted content.
11. Release QA.

## Migration Batch Sequence

The ordered sequence is documented in `docs/HEALTHOS_BACKEND_MIGRATION_SEQUENCE.md` and represented in `src/features/backendPlan/migrationSequence.ts`.

## RLS Sequence

Start with owner-only profile/preferences, then care subjects, guardians, family membership, explicit medical sharing permissions, caregiver limits, records, storage, AI imports, reminders/notifications, and trusted content saved/public split.

## Storage Sequence

Profile avatars first, then records/documents, scan source images, AI evidence thumbnails, and only source-backed trusted content images later.

## Generated Types Plan

No generated database types currently exist. Generate types only after approved migrations are applied in a future implementation phase, then wire the Supabase client and services to generated row/insert/update types.

## Service Sequence

Services should be implemented in this order: profile, onboarding/preferences, care profile, family circle, sharing permissions, records, storage, calendar/reminder, medication/supplement, pregnancy, baby/child, women's health, AI import, fitness, nutrition, trusted content, notifications.

## UI Connection Sequence

Connect Auth/Profile/Settings first, then onboarding, health profile context, family basics, records, scan-to-records drafts, medication/supplements, calendar/reminders, life-stage realms, AI import review, nutrition, fitness, trusted content, and notifications later.

## MVP Backend Scope

MVP requires account/preferences, privacy/ownership foundation, family sharing permissions, records/storage, calendar/reminders, reviewed medication/supplement saves, life-stage private logs, AI import review persistence, nutrition/fitness foundations, RLS, storage policies, and generated types.

## After-MVP Scope

Billing, full push, caregiver payments, medical/pharmacy directories, device integrations, native health integrations, advanced analytics, automated export/delete expansion, content admin, advanced AI search, child age transfer, multi-country content rules, AI source verification, and offline sync are after-MVP.

## Release Blockers

Critical blockers are RLS, records storage, record file/link tables, family permissions, AI import review persistence, persistent realm schemas, generated types, reminder source/history, privacy/legal review, export/delete coverage, and post-implementation QA.

## What Was Not Implemented

- No SQL migrations.
- No remote Supabase commands.
- No edge function deployment.
- No service writes.
- No UI redesign.
- No fake data.
- No packages.

## Typecheck Result

- First `npm run typecheck` failed with TS2590 union-complexity errors in HealthOS UI components.
- The specific reported component expressions were narrowed.
- The allowed single rerun still failed at three remaining TS2590 sites.
- Those three remaining sites were narrowed after the rerun.
- Typecheck was not run a third time to respect the phase instruction not to repeatedly run commands.

## Next Recommended Phase

Start implementation with Batch 1: account/preferences and generated type preparation. Do not move to shared health data until family permissions and RLS are explicit.
