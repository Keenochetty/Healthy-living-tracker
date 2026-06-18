# HealthOS Medication + Supplements Schema

Date: 2026-06-17

## Canonical Decision

Batch 6 uses these canonical tables:

- `medications`
- `medication_schedules`
- `medication_logs`
- `medication_side_effect_notes`
- `medication_refill_reminders`
- `supplements`
- `supplement_schedules`
- `supplement_logs`
- `medication_review_flags`

An older `medications` table already exists, so the migration extends it with canonical nullable owner/review/source/privacy columns and compatibility fields. New supplement and medication support tables are created if missing.

## Existing Equivalent Tables Found

- `medications`: older family-member medication table with `family_id`, `family_member_id`, `name`, `dosage`, `schedule_notes`, `active`, and `privacy_level`.
- `medicine_logs`: older medication log table with `medicine_name`, `dosage`, `taken_at`, `next_dose_at`, and notes.
- `records`, `record_links`, `record_extractions`: Batch 4 record foundation.
- `reminders`, `calendar_events`, `calendar_event_links`: Batch 5 calendar/reminder foundation.
- `care_profiles`, `sharing_permissions`, `family_circles`: previous backend batches.

No equivalent canonical `supplements`, `supplement_schedules`, `supplement_logs`, `medication_side_effect_notes`, `medication_refill_reminders`, or `medication_review_flags` table was found in active migrations.

## Ownership

Canonical Batch 6 rows use `owner_user_id references auth.users(id)`. Subject context uses `subject_care_profile_id references public.care_profiles(id)`.

## Link Columns

Medication and supplement records include `source_record_id` and `ai_import_id`. Schedules include `linked_reminder_id`. Logs include `source_reminder_id`.

## Generated Types

Generated Supabase types are stale for Batch 6. The frontend feature layer uses domain types and tolerant mappers until migrations are applied and types are regenerated.

## Migration Decision

Created additive draft migration:

- `supabase/migrations/20260617193000_healthos_batch_6_medication_supplements.sql`

The migration was not applied.
