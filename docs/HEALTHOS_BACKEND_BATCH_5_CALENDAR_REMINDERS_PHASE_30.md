# HealthOS Backend Batch 5 - Calendar + Reminders Foundation

Date: 2026-06-17

## Scope

Batch 5 creates the calendar/reminder metadata foundation only. No UI redesign, source realm writes, push backend, native/external calendar sync, package installs, remote Supabase commands, fake seed data, or full builds were performed.

## Files Inspected

- Latest Style Sheet 30 attachments under `C:\Users\keeno\.codex\attachments`.
- Supabase skill: `.agents/skills/supabase/SKILL.md`.
- Supabase migrations under `supabase/migrations`.
- `package.json`, `app.json`, `.env.example`, `src/lib/supabase.ts`.
- Existing notification service: `src/services/reminders/notificationService.ts`.
- Active calendar/reminder areas: `src/app/health-calendar/index.tsx`, `src/app/reminders/index.tsx`, `src/app/reminders/[reminderId].tsx`.
- Active HealthOS calendar/notifications components under `src/components/healthos/calendar` and `src/components/healthos/notifications`.
- Existing local types: `src/types/healthTimeline.ts`.
- Prior backend docs for Batches 1-4, schema normalization, RLS/privacy, record linking, sharing permissions, migration sequence, realm table map, data model alignment, and schema gap reporting.

## Files Created

- `supabase/migrations/20260617190000_healthos_batch_5_calendar_reminders.sql`
- `src/features/calendarReminders/calendarReminderTypes.ts`
- `src/features/calendarReminders/calendarReminderDefaults.ts`
- `src/features/calendarReminders/calendarReminderMappers.ts`
- `src/features/calendarReminders/calendarReminderValidation.ts`
- `src/features/calendarReminders/calendarReminderPrivacy.ts`
- `src/features/calendarReminders/calendarReminderRecurrence.ts`
- `src/features/calendarReminders/localNotificationAdapter.ts`
- `src/features/calendarReminders/calendarReminderService.ts`
- `src/features/calendarReminders/useCalendarEvents.ts`
- `src/features/calendarReminders/useCalendarEventDetail.ts`
- `src/features/calendarReminders/useReminders.ts`
- `src/features/calendarReminders/useReminderDetail.ts`
- `src/features/calendarReminders/useReminderHistory.ts`
- `src/features/calendarReminders/useNotificationEvents.ts`
- `src/features/calendarReminders/index.ts`
- `docs/style-sheets/HEALTHOS_STYLE_SHEET_30_BACKEND_BATCH_5_CALENDAR_REMINDERS.md`
- `docs/HEALTHOS_CALENDAR_REMINDERS_SCHEMA.md`
- `docs/HEALTHOS_CALENDAR_REMINDERS_RLS.md`
- `docs/HEALTHOS_REMINDER_REVIEW_SCHEDULING_MODEL.md`
- `docs/HEALTHOS_LOCAL_NOTIFICATION_ADAPTER.md`
- `docs/HEALTHOS_CALENDAR_REMINDER_SERVICE_IMPLEMENTATION.md`
- `docs/HEALTHOS_CALENDAR_EVENT_LINKING_MODEL.md`
- `docs/HEALTHOS_CALENDAR_REMINDERS_GENERATED_TYPES_STATUS.md`
- `docs/HEALTHOS_BATCH_5_UI_CONNECTIONS.md`
- `docs/HEALTHOS_PUSH_NOTIFICATION_DEFERRED_PLAN.md`
- `docs/HEALTHOS_BACKEND_BATCH_5_CALENDAR_REMINDERS_PHASE_30.md`

## Files Updated

- None of the active routes or existing services were modified.

## Existing Tables Found

- `calendar_events`: existing legacy smart calendar table with family/profile/child ownership fields, created-by field, event time fields, privacy fields, and legacy RLS.
- `reminders`: existing legacy table with family/family member ownership fields, created-by user field, reminder type, due time, status, notes, and legacy family-access RLS.
- `notifications`: existing app notification table.
- `device_tokens`: existing token table from older schema; push backend remains deferred.
- `notification_preferences`: created by Batch 1.
- `records`, `record_links`: created by Batch 4.
- `sharing_permissions`, `care_profiles`, `family_circles`: created by earlier backend batches.

## Migration Draft

Created additive migration draft `20260617190000_healthos_batch_5_calendar_reminders.sql`.

It extends existing `calendar_events` and `reminders` with nullable canonical columns, creates missing `calendar_event_links`, `reminder_history`, and `notification_events`, adds indexes/comments, and does not add destructive constraints or source realm tables.

## RLS Policy Draft

Created conservative owner-only RLS policies for canonical ownership fields. Shared/caregiver read policies are deferred because family membership alone is not sufficient for private health reminders.

Legacy broad calendar/reminder policies were not removed in this batch to avoid breaking existing active routes.

## Generated Types Status

Generated Supabase types are stale for Batch 5. Domain types were added in `src/features/calendarReminders`, and generated types should be refreshed after the migration is applied.

## Domain Types Status

Calendar event, event link, reminder, reminder history, notification event, backend status, and service result types were added.

## Privacy Helpers Status

Added conservative helpers for sensitive calendar event types, sensitive reminder categories, review requirements, privacy-safe reminder title/body copy, shared-context detail guards, and labels.

## Recurrence Helpers Status

Added simple recurrence helpers for `none`, `daily`, `weekly`, `monthly`, and `yearly`. Complex RRULE parsing remains deferred.

## Local Notification Adapter Status

Created adapter wrappers because `expo-notifications` is already installed and existing local notification code is present. The adapter does not request permission on load, does not auto-schedule, validates review-first rules, and uses privacy-safe copy.

## Calendar/Reminder Service Status

Created service methods for calendar events, event links, reminders, reminder history, notification events, review, scheduling metadata, completion, snooze, cancel, and review-first AI/record/calendar reminder candidates.

## Hooks Status

Created hooks for event lists, event detail, reminders, reminder detail, reminder history, and notification events. Hooks return safe statuses and no fake data.

## Calendar Route Connection Status

Deferred. The active Health Calendar still uses the existing local calendar/reminder engine. It was not rewired until the migration is applied and generated types are refreshed.

## Reminder Center Connection Status

Deferred. The active Reminder Center still uses the existing local reminder/notification data path. Batch 5 hooks are available but not wired into active UI.

## Home Upcoming Events/Reminders Status

Deferred. No fake counts or fake upcoming events/reminders were introduced.

## AI/Scan Candidate Status

Review-first candidate service methods were added. Active AI/Scan persistence remains deferred.

## Push Notification Backend Deferred Status

Push token registration, push token storage changes, push sending edge functions, server scheduling jobs, and Expo push service calls remain deferred.

## Deferred Items

- Applying the migration.
- Regenerating Supabase types.
- Tightening/removing legacy broad calendar/reminder policies.
- Calendar route backend wiring.
- Reminder Center backend wiring.
- Home upcoming event/reminder wiring.
- AI/Scan full review persistence.
- Source realm writes.
- Push backend.
- Native/external calendar sync.
- Complex recurrence engine.

## Typecheck Result

`npm run typecheck` passed on the first run.

## Risks / Blockers

- Existing legacy `calendar_events` and `reminders` policies may still be broader than the canonical owner-only Batch 5 policies.
- Existing active UI remains local-service backed until migration/type generation are complete.
- Batch 5 service methods are ready, but runtime availability depends on applying the draft migration.

## Next Recommended Backend Batch

Backend Batch 6 should wire one source realm at a time into the review-first reminder model, starting with medication/supplements because they have the highest scheduling-safety requirements.
