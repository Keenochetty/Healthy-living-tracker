# HealthOS Backend Batch 2 — Care Profiles + Family Identity

Date: 2026-06-17

## Summary

Batch 2 adds a conservative care profile identity layer for self, child, dependent, elder, pregnancy-subject, and caregiver-contact identities. It does not migrate feature data yet and does not alter the existing child/caregiver/family tables.

## Files Created

- `supabase/migrations/20260617173000_healthos_batch_2_care_profiles_identity.sql`
- `src/features/careProfiles/*`
- `docs/style-sheets/HEALTHOS_STYLE_SHEET_27_BACKEND_BATCH_2_CARE_PROFILES_FAMILY_IDENTITY.md`
- `docs/HEALTHOS_CARE_PROFILE_SCHEMA.md`
- `docs/HEALTHOS_CARE_PROFILE_RLS.md`
- `docs/HEALTHOS_CARE_PROFILE_SERVICE_IMPLEMENTATION.md`
- `docs/HEALTHOS_FAMILY_IDENTITY_FOUNDATION.md`
- `docs/HEALTHOS_CARE_PROFILE_GENERATED_TYPES_STATUS.md`
- `docs/HEALTHOS_BATCH_2_UI_CONNECTIONS.md`
- `docs/HEALTHOS_CHILD_IDENTITY_TRANSITION_NOTES.md`

## Existing Tables Preserved

- `profiles`
- `families`
- `family_members`
- `family_memberships`
- `children`
- `caregiver_profiles`
- `caregiver_child_access`

## Verification

Typecheck should be run with `npm run typecheck`. Full build/export was intentionally not run.

## Deferred

- Applying the migration.
- Generating Supabase database types.
- Migrating local AsyncStorage child/caregiver identities into `care_profiles`.
- Connecting Health Hub, Baby/Child, Pregnancy, and Caregiver screens to live care profile reads.
