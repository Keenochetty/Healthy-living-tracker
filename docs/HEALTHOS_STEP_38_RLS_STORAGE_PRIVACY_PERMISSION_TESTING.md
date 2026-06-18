# HealthOS Step 38 - RLS, Storage, Privacy + Permission Testing

Date: 2026-06-18

## Scope

This step audited local RLS SQL, storage policies, privacy boundaries, permission sharing, child/guardian access, AI import boundaries, notification privacy, shared-context UI, and service guards. No migrations, remote Supabase commands, SQL tests, bucket creation, policy changes, type generation, Edge Function deployment, package installs, fake data, seed data, UI redesign, or full build/export were performed.

## Files Inspected

- Step 38 request attachments.
- `supabase/migrations/*`
- `supabase/functions/*`
- `.env.example`
- `src/features/backend/*`
- `src/features/account`, `careProfiles`, `familySharing`, `records`, `calendarReminders`, `medicationSafety`, `lifeStageHealth`, `aiImport`, `fitnessNutrition`, `trustedContent`
- `src/lib/supabase.ts`, `src/lib/profileContactStorage.ts`
- `src/services/storage/privateFileService.ts`
- HealthOS route/component docs from Steps 36 and 37.
- Existing security docs including RLS, storage, sharing, records, and AI security docs where present.

## Files Created

- `docs/style-sheets/HEALTHOS_STYLE_SHEET_38_RLS_STORAGE_PRIVACY_PERMISSION_TESTING.md`
- `docs/HEALTHOS_STEP_38_RLS_STORAGE_PRIVACY_PERMISSION_TESTING.md`
- `docs/HEALTHOS_RLS_POLICY_AUDIT_MATRIX.md`
- `docs/HEALTHOS_STORAGE_POLICY_AUDIT_MATRIX.md`
- `docs/HEALTHOS_PERMISSION_SHARING_TEST_CASES.md`
- `docs/HEALTHOS_PRIVACY_SHARED_CONTEXT_AUDIT.md`
- `docs/HEALTHOS_AI_IMPORT_PRIVACY_BOUNDARY_AUDIT.md`
- `docs/HEALTHOS_NOTIFICATION_PRIVACY_AUDIT.md`
- `docs/HEALTHOS_RLS_STORAGE_FIX_BACKLOG.md`
- `docs/HEALTHOS_SQL_POLICY_TEST_EXAMPLES.md`
- `docs/HEALTHOS_CHILD_GUARDIAN_PERMISSION_AUDIT.md`
- `docs/HEALTHOS_WOMENS_HEALTH_PRIVACY_AUDIT.md`
- `docs/HEALTHOS_RECORDS_STORAGE_PRIVACY_AUDIT.md`

## Files Updated

- `src/features/records/recordService.ts`
- `src/services/storage/privateFileService.ts`
- `docs/HEALTHOS_STEP_38_RLS_STORAGE_PRIVACY_PERMISSION_TESTING.md`

## Code Guard Fixes

- Replaced raw storage backend error messages in `privateFileService` with privacy-safe generic messages.
- Replaced raw record service error passthrough with privacy-safe fallback messages.

## RLS Matrix Status

Created `docs/HEALTHOS_RLS_POLICY_AUDIT_MATRIX.md`.

## Tables With RLS Confirmed

Most planned MVP tables across Batches 1-10 have local `alter table ... enable row level security` statements. Confirmed groups include account preference tables, care profiles, family sharing, records/storage metadata, calendar/reminders, medication/supplements, life-stage health, AI import job/envelope/evidence/review tables, fitness/nutrition, and trusted content tables.

## Tables Missing RLS Confirmation

- `profile_photo_metadata`
- `caregiver_profiles`
- `ai_conversations`
- `ai_messages`

## Risky Policies Found

- `using (true)` exists for reference/read-only tables and must remain limited to non-sensitive reference data.
- `to anon, authenticated using (true)` exists for fitness muscle map reference tables.
- Legacy grant repair migration grants activity log API access to `anon, authenticated`; it requires actor testing to confirm RLS constrains rows.

## Storage Buckets Found

- `health-records-private`
- `medical-documents`
- `profile-avatars`
- `profile-photos`
- `activity-photos`
- `documents`
- `caregiver-uploads`
- `fitness-assets`
- `food-images`
- `baby-records-private`
- `medication-labels-private`
- `supplement-labels-private`
- `pregnancy-records-private`
- `ai-temp-uploads`

## Storage Policy Status

Strongest confirmed policy coverage is for `health-records-private`, `medical-documents`, `profile-avatars`, and `activity-photos`. Several helper-referenced private buckets need creation/policy confirmation.

## Public Bucket Risks

No private health bucket was confirmed public. `fitness-assets` is public and should remain non-user catalog PNG assets only.

## Family Permission Audit Result

Explicit sharing permissions are present in the records sharing model and family/caregiver schema. Family membership alone must not expose medical details; actor tests are documented but not run.

## Caregiver Permission Audit Result

Caregiver assignments exist, but limited assignment access requires actor testing. Caregiver membership must not imply full health access.

## Child / Guardian Audit Result

Child tables have local RLS enable statements. Guardian/caregiver actor tests remain deferred.

## Women's Health Privacy Audit Result

Women's health, contraception, and sex-day tables have local RLS enable statements. Sex-day logs must remain strictly private and excluded from shared contexts.

## Records / Storage Privacy Audit Result

Records RLS and `health-records-private` storage policy are well structured locally. Runtime storage/RLS tests remain required.

## AI Import Boundary Audit Result

AI import candidate tables are private and review-first. AI temp storage policy and planned AI conversation/message tables remain unresolved.

## Notification Privacy Audit Result

Reminder/notification RLS is locally present. Device-level notification title/body privacy needs QA in a development build.

## Shared-Context UI Audit Result

No shared-context expansion was added. Family/caregiver/child/calendar overlay contexts remain medium risk until actor tests are run.

## Review-First Flow Audit Result

Preserved. No direct final-save, auto-import, or auto-scheduling behavior was added.

## Fix Backlog Created

Created `docs/HEALTHOS_RLS_STORAGE_FIX_BACKLOG.md`.

## Typecheck Result

Passed.

Command:

```bash
npm run typecheck
```

Result:

```text
tsc --noEmit
```

## Remaining Blockers

- No SQL tests were run by instruction.
- No generated Supabase types exist.
- Several planned tables are not confirmed in local migrations.
- Several private helper buckets lack confirmed storage policies.
- Family/caregiver/child actor tests remain deferred.

## Next Recommended Step

Run the documented SQL policy tests against a local or staging Supabase project with synthetic users after migrations are applied, then close or migrate the backlog items with verified evidence.
