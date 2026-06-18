# HealthOS Canonical Model Decisions

Date: 2026-06-17

## Accepted For Current MVP Direction

- Use Supabase Auth as account identity.
- Keep `profiles` as the active app profile table for now.
- Treat `family_memberships` as the preferred account-to-family membership model.
- Treat `children` as the canonical child identity table.
- Treat `caregiver_profiles` as caregiver identity and `caregiver_child_access` as assignment/access.
- Treat `reminders` as scheduled user intent and `notifications` as delivery/inbox artifacts.
- Treat AI imports as review-first drafts. AI output must not write directly into health records.
- Use nutrition naming in backend schema; keep food as a route/product label.
- Use women's health/cycle-specific private schema; keep cycle as route alias.
- Use trusted content tables for public/reference content and separate saved-content tables for user-private saves.

## Deferred Decisions

- Whether to introduce `care_profiles`, `person_profiles`, or another care-subject table name.
- Whether to rename `families` to `family_circles`.
- Whether to backfill `medical_records`, `medical_documents`, and `documents` into `health_records`, `record_files`, and `record_links`.
- How child ownership and data transfer works at age thresholds.
- Whether pregnancy-to-child transition creates a child row automatically or only through explicit user confirmation.

## Non-Goals For This Phase

- No table renames.
- No destructive migrations.
- No RLS rewrite.
- No storage policy rewrite.
- No remote Supabase commands.

