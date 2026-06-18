# HealthOS Style Sheet 27 — Backend Batch 2: Care Profiles + Family Identity

## Purpose

This pass adds the backend-facing identity foundation for care subjects without replacing the existing family, child, pregnancy, or caregiver feature surfaces.

## Scope Applied

- Drafted `care_profiles`, `care_profile_relationships`, and `active_care_profile_preferences`.
- Kept existing `children`, `family_members`, `family_memberships`, `caregiver_profiles`, and `caregiver_child_access`.
- Added a TypeScript domain service and hooks under `src/features/careProfiles`.
- Deferred UI wiring to read-only adoption after the migration is applied and Supabase types are generated.

## Guardrails

- No full build was run.
- No remote Supabase command was run.
- No existing table was renamed, dropped, or replaced.
- No caregiver duplicate table was created.
- No child, pregnancy, or caregiver logs were added in this batch.
