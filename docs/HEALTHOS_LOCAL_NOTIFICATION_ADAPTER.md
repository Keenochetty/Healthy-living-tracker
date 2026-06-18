# HealthOS Local Notification Adapter

Date: 2026-06-17

## Status

`expo-notifications` is installed and configured in the app config. Batch 5 creates `src/features/calendarReminders/localNotificationAdapter.ts`.

## Behavior

The adapter wraps the existing local notification service in `src/services/reminders/notificationService.ts`.

Methods:

- `getNotificationPermissionStatus`
- `requestNotificationPermissionByUserAction`
- `scheduleLocalReminderNotification`
- `cancelLocalReminderNotification`
- `openNotificationSettings`

## Permission Rule

The adapter does not request permission on module load or screen load. Permission requests remain user-action driven.

## Scheduling Rule

The adapter does not schedule automatically. It validates review status, schedule time, and privacy-safe copy before calling the existing local scheduling service.

## Privacy Copy

Lock-screen title/body are derived from `titlePrivacySafe` and category-specific safe body helpers. Private details remain in `detailsPrivate`, not notification copy.

## Push Status

Push notification backend is deferred. The adapter does not register tokens, call Expo push APIs, or create push jobs.
