# HealthOS Style Sheet 28 — Backend Batch 3: Family Circles + Permissions

## Purpose

Backend Batch 3 adds the family/circle and explicit permission-sharing foundation. This is not a UI redesign phase.

## Scope Applied

- Added canonical draft tables for family circles, circle members, caregiver assignments, and family shared updates.
- Extended existing `family_invites` and `sharing_permissions` with canonical columns without dropping legacy columns.
- Added conservative RLS helper functions and policies.
- Added `src/features/familySharing` domain types, defaults, permission helpers, mappers, validators, service methods, and hooks.
- Deferred UI rewiring until the draft migration is applied and generated Supabase types are refreshed.

## Privacy Rule

Family membership grants relationship context and circle visibility only. Medical details require explicit permission records.

## Not Included

No records storage, child logs, pregnancy logs, women’s health logs, medication sharing implementation, caregiver billing, notifications backend, AI import persistence, package installs, remote Supabase commands, or full builds.
