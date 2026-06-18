# HealthOS Calendar + Reminder Service Implementation

Date: 2026-06-17

## Feature Folder

Created:

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

## Service Methods

Implemented:

- `getCurrentAuthUser`
- `getCalendarEvents`
- `getCalendarEventById`
- `createCalendarEvent`
- `updateCalendarEvent`
- `cancelCalendarEvent`
- `getCalendarEventLinks`
- `createCalendarEventLink`
- `getReminders`
- `getReminderById`
- `createReminderDraft`
- `reviewReminder`
- `scheduleReminderInApp`
- `markReminderCompleted`
- `snoozeReminder`
- `cancelReminder`
- `createReminderHistoryEvent`
- `getReminderHistory`
- `getNotificationEvents`
- `markNotificationEventRead`
- `createReminderFromCalendarEvent`
- `createReminderCandidateFromAI`
- `createReminderCandidateFromRecord`

## Status Handling

Service results use:

- `ready`
- `missingAuth`
- `missingTable`
- `notificationDeferred`
- `pushDeferred`
- `deferred`
- `error`

Missing tables/columns return deferred-safe results and do not crash hooks.

## Hook Behavior

Hooks expose data, loading/status, error, refresh, and safe action methods. They do not create fake events, fake reminders, fake history, or auto-schedule notifications.

## UI Connection

Active Calendar, Reminder Center, and Home route connections are deferred until the Batch 5 migration is applied and generated types are refreshed. Existing local UI behavior remains untouched.
