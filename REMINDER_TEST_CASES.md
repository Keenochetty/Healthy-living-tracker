# Reminder Test Cases

## In-App Reminders
- Create, edit, delete, complete, skip, snooze, cancel, pause, and resume reminders.
- In-app reminders work with device notification permission denied.
- Overdue wording uses `past due` or allowed category wording, not scary language.
- Repeating reminders generate only a rolling window.
- Duplicate prevention uses source/sourceType/sourceId metadata.

## Notifications
- Permission request appears only after explanation.
- Granted, denied, unavailable, and partial states render.
- Sensitive categories default to private/category-only lock-screen text.
- Quiet hours delay or silence without urgent wording.
- Notification response routes to the stored route and params.
- Reconciliation runs on launch, foreground, profile switch, and settings changes.
- Orphan scheduled notifications are cleared.

## Sensitive Categories
- Medication and supplement quick actions require confirmed action paths.
- Baby medicine reminders do not include dose advice.
- Women’s Health, Pregnancy, Men’s Health, Records, Biometrics, and Device Sync do not expose private details.
- Caregiver-visible reminders are limited to assigned categories and tasks.
