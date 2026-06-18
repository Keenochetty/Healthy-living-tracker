# HealthOS Backend Batch 3 — Family Circles + Permission-Based Sharing

Date: 2026-06-17

## Files Inspected

- `supabase/migrations`
- `supabase/functions`
- `supabase/seed.sql`
- `src/lib/supabase.ts`
- `src/lib/familyPermissionsStorage.ts`
- `src/lib/caregiverStorage.ts`
- `src/lib/childStorage.ts`
- `src/types/database.ts`
- `src/types/familyPermissions.ts`
- `src/types/caregiver.ts`
- `src/features/careProfiles`
- `src/features/privacy/sharingPermissions.ts`
- `src/components/healthos/family`
- `src/components/healthos/settings`
- `src/components/healthos/health`
- `src/components/healthos/babyChild`
- `src/components/healthos/pregnancy`
- `src/components/healthos/womensHealth`
- `.env.example`
- `package.json`
- Previous backend batch docs

## Files Created

- `supabase/migrations/20260617180000_healthos_batch_3_family_circles_permissions.sql`
- `src/features/familySharing/familySharingTypes.ts`
- `src/features/familySharing/familySharingDefaults.ts`
- `src/features/familySharing/familySharingMappers.ts`
- `src/features/familySharing/familySharingValidation.ts`
- `src/features/familySharing/familySharingPermissions.ts`
- `src/features/familySharing/familySharingService.ts`
- `src/features/familySharing/useFamilyCircles.ts`
- `src/features/familySharing/useActiveFamilyCircle.ts`
- `src/features/familySharing/useFamilyMembers.ts`
- `src/features/familySharing/useSharingPermissions.ts`
- `src/features/familySharing/useCaregiverAssignments.ts`
- `src/features/familySharing/index.ts`
- Batch 3 documentation files

## Files Updated

- None of the existing app screens were rewired in this batch.

## Existing Tables Found

- `families`
- `family_members`
- `family_memberships`
- `family_invites`
- `sharing_permissions`
- `caregiver_profiles`
- `caregiver_child_access`
- `care_profiles`

Missing canonical Batch 3 tables before this draft:

- `family_circles`
- `family_circle_members`
- `caregiver_assignments`
- `family_shared_updates`

## Migration Draft

Created one additive migration draft. It was not applied.

## RLS Policy Draft

Created conservative policies for family circles, members, invites, sharing permissions, caregiver assignments, and shared updates. Medical sharing remains permission-gated and is not granted by membership alone.

## Generated Types Status

Generated Supabase database types do not include Batch 3 tables. The feature uses local domain types until migrations are applied and types are regenerated.

## Family Domain Types Status

Created in `src/features/familySharing/familySharingTypes.ts`.

## Permission Helpers Status

Created conservative UI/service helpers in `familySharingPermissions.ts`. Unknown, inactive, pending, removed, expired, or revoked access does not grant permission.

## Family Service Status

Created `familySharingService.ts` with auth-aware methods and `missingTable` handling. It uses the existing Supabase client and does not use service-role keys.

## Family Hooks Status

Created hooks for circles, active circle, members, sharing permissions, and caregiver assignments. Hooks do not create fake data or loop-create rows.

## Family Tab Connection Status

Deferred. The current Family tab still uses existing local family helpers. Real Batch 3 wiring should happen after migration apply and generated types.

## Profile / Settings Connection Status

Deferred. Settings already has family sharing rows, but Batch 3 service wiring is held until backend readiness is confirmed.

## Health Hub Sharing Indicator Status

Deferred. Health Hub should only show real sharing indicators after permissions are live.

## Baby / Child Sharing Status

Deferred. Child logs remain private and were not connected to family sharing.

## Pregnancy / Women’s Health Privacy Status

Deferred. Pregnancy and women’s health stay private by default.

## Caregiver Assignment Status

Draft table, RLS, service, and hook were created. Billing, rates, payments, and full medical access are deferred.

## Invite Foundation Status

Existing `family_invites` was extended with canonical columns. The service creates invite records only and does not send email or expose token hashes.

## Deferred Items

- Applying migrations.
- Regenerating Supabase types.
- Replacing local Family tab data with backend family circles.
- Backfilling legacy `families` into `family_circles`.
- Full permission management UI.
- Records, medication, child logs, pregnancy, and women’s health permission enforcement.

## Typecheck Result

`npm run typecheck` passed.

## Risks / Blockers

- The migration depends on Batch 2 `care_profiles`.
- Existing `sharing_permissions` has multiple legacy shapes; this batch adds canonical columns but does not backfill.
- Existing older policies still allow broad family visibility in some medical tables and must be tightened in later realm batches.

## Next Recommended Backend Batch

Batch 4: records storage metadata and explicit shared-record access after family permission tables are applied and generated types are refreshed.
