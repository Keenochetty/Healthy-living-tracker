# HealthOS Batch 1 UI Connections

Date: 2026-06-17

## Profile / Settings

Current settings UI already reads existing auth/profile/local notification data through:

- `src/context/AuthContext.tsx`
- `src/components/healthos/settings/useHealthOSProfileSettingsData.ts`
- `src/lib/profileContactStorage.ts`
- `src/services/reminders/notificationService.ts`

New Batch 1 account hooks are exported but not forced into Settings writes because draft tables are not applied and generated types are missing.

## Onboarding

Current onboarding remains connected to:

- `src/app/onboarding/index.tsx`
- `src/lib/onboardingStorage.ts`
- existing local preferences and profile sync helpers

`useOnboardingPreferences` exists for the future backend connection, but active writes are deferred.

## Home / Shell

No Home/Shell profile read change was made in Batch 1. Existing profile reads should continue through auth context and local preferences.

## Notification Preferences

`useNotificationPreferences` stores preferences only after the draft table exists. No notification permission request, scheduling, push token registration, or push backend was added.

