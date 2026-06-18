# HealthOS Notification Privacy Audit

Date: 2026-06-18

## Result

Reminder and notification tables have local RLS enable statements. Notification behavior remains app/local-service driven and should stay privacy-safe by default.

## Confirmed

- `reminders`, `reminder_history`, and `notification_events` have local RLS enable statements.
- Step 37 did not add auto-scheduling.
- Notification permission is not requested by the Step 38 changes.
- Shared Home/calendar widgets keep sensitive data inside app UI.

## Required Privacy Rules

- Lock-screen titles must be privacy-safe.
- Medication names should not be exposed by default on OS notifications.
- Women's health details should not appear on OS notifications.
- Record document names should not appear on OS notifications if sensitive.

## Deferred Tests

- Local notification adapter title/body redaction.
- Reminder review status before scheduling.
- Notification preference enforcement.

## Risk

Medium until device-level notification QA is run in a development build.
