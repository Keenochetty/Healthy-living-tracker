# HealthOS Style Sheet 30 - Backend Batch 5: Calendar + Reminders Foundation

## Purpose

Backend Batch 5 defines the HealthOS calendar/reminder metadata foundation. It covers calendar event metadata, reminder drafts, reminder history, notification event metadata, source-linked reminders, privacy-safe notification copy, review-first scheduling, and local notification readiness.

## Scope

Allowed:

- Additive calendar/reminder migration draft.
- Conservative owner-only RLS draft where ownership is explicit.
- Calendar/reminder domain types, defaults, privacy helpers, recurrence helpers, mappers, validation, service methods, and hooks.
- Local notification adapter only because `expo-notifications` already exists.
- Honest deferred states for Calendar, Reminder Center, Home, AI/Scan, push, and source realm writes.

Not allowed:

- UI redesign.
- Source realm writes for medication, pregnancy, baby/child, women health, records, nutrition, or fitness.
- Auto-scheduling reminders.
- Permission requests on app load.
- Push token registration or push backend.
- Native/external calendar sync.
- Remote Supabase commands, full builds, package installs, or fake seed data.

## Safety Rule

A reminder record is not a scheduled notification. A reminder can be a draft, needs review, scheduled in app data only, local scheduled after user action, completed, snoozed, missed, skipped, cancelled, failed, or deferred. Sensitive categories must remain review-first and private by default.

## Verification

Run only:

```bash
npm run typecheck
```

Do not run remote Supabase commands, app builds, Expo export, EAS build, or package installation in this batch.
