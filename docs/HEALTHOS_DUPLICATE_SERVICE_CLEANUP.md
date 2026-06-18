# HealthOS Duplicate Service Cleanup

Date: 2026-06-18

## Summary

Duplicate and legacy service layers still exist. No deletions were made in Step 36 because active routes and components still import them.

## Legacy Areas Observed

- `src/lib/*Storage.ts` modules for pregnancy, women's health, trusted content, family permissions, records, onboarding, AI, and profile sync.
- `src/services/fitness*` modules for imported plans, activation, history, content, and muscle maps.
- `src/services/nutrition/*` modules for nutrition logging and related flows.
- `src/services/reminders/*` modules for notification/reminder behavior.
- `src/services/storage/privateFileService.ts` for private storage metadata/file handling.

## Canonical Target

New backend work should prefer feature folders under `src/features/<feature>/`, with shared backend primitives from `src/features/backend`.

## Deferred Cleanup

Convert legacy modules to compatibility wrappers only after:

- generated Supabase types are present,
- route behavior has a feature-by-feature QA pass,
- storage policy behavior is verified,
- no active import depends on legacy-specific data shape.
