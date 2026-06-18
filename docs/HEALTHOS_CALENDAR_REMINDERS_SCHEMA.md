# HealthOS Calendar + Reminders Schema

Date: 2026-06-17

## Canonical Decision

Batch 5 uses these canonical tables:

- `calendar_events`
- `calendar_event_links`
- `reminders`
- `reminder_history`
- `notification_events`

Existing `calendar_events` and `reminders` were found, so the migration draft extends them additively rather than recreating them. `calendar_event_links`, `reminder_history`, and `notification_events` are created if missing.

## Existing Tables Found

- `calendar_events`: found in `20260531065657_smart_calendar_foundation.sql` with legacy `family_id`, `profile_id`, `child_id`, `created_by`, `calendar_type`, `start_time`, `end_time`, privacy fields, and RLS. Later migrations add delete behavior and helper-based family policies.
- `reminders`: found in `202605270004_full_health_product_schema.sql` with `family_id`, `family_member_id`, `created_by_user_id`, `title`, `reminder_type`, `due_at`, `status`, and notes.
- `notifications`: found in `20260531060542_first_core_schema.sql`; retained as a legacy notification table.
- `device_tokens`: found in `20260531060542_first_core_schema.sql`; push token backend remains deferred.
- `notification_preferences`: found in Batch 1 migration.
- `records`, `record_links`: found in Batch 4 migration.
- `sharing_permissions`, `care_profiles`, `family_circles`: found in prior backend batches.

## Batch 5 Columns

`calendar_events` receives nullable canonical columns for owner, subject care profile, privacy scope, canonical start/end times, all-day flag, timezone, source type, review status, AI/record provenance, family circle, and cancellation.

`reminders` receives nullable canonical columns for owner, subject care profile, calendar event link, privacy-safe title, private details, category, source realm, source row/record, AI import reference, privacy scope, urgency, scheduled time, timezone, repeat rule, quiet-hours respect, local notification ID, push status, review requirement, review time, and cancellation.

New tables:

- `calendar_event_links`: links an event to a realm/table/row without granting access.
- `reminder_history`: lifecycle events for reminders.
- `notification_events`: privacy-safe app-side notification metadata, not push delivery infrastructure.

## Ownership

New canonical ownership is `owner_user_id references auth.users(id)`. Existing legacy ownership fields remain untouched for compatibility.

## Generated Types

Generated Supabase types are currently stale for Batch 5. The frontend layer uses domain types and string table names, matching prior Batch 4 patterns. Regenerate Supabase types after the migration is applied locally or remotely.

## Migration Decision

Created draft migration:

- `supabase/migrations/20260617190000_healthos_batch_5_calendar_reminders.sql`

It is additive only and was not applied.
