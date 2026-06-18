# HealthOS Backend Batch 1 Account Profile Onboarding Phase 26

Date: 2026-06-17

## Scope

This batch creates the account/profile/onboarding/preferences foundation without applying migrations, redesigning UI, adding packages, creating fake data, or touching unrelated realm schemas.

## Files Inspected

- `supabase/migrations`
- `supabase/functions`
- `src/lib/supabase.ts`
- `src/context/AuthContext.tsx`
- `src/lib/profileSync.ts`
- `src/lib/profileContactStorage.ts`
- `src/lib/onboardingStorage.ts`
- `src/lib/userPreferences.ts`
- `src/services/reminders/notificationService.ts`
- `src/components/healthos/settings/useHealthOSProfileSettingsData.ts`
- `src/components/healthos/settings/useHealthOSProfileSettingsActions.ts`
- `src/app/onboarding/index.tsx`
- `src/types/database.ts`
- `src/types/onboarding.ts`
- `src/types/profile.ts`
- `.env.example`
- `package.json`
- Phase 24 and Phase 25 backend docs

## Files Created

- `supabase/migrations/20260617170000_healthos_batch_1_account_profile_preferences.sql`
- `src/features/account/accountTypes.ts`
- `src/features/account/accountDefaults.ts`
- `src/features/account/accountMappers.ts`
- `src/features/account/accountValidation.ts`
- `src/features/account/accountService.ts`
- `src/features/account/useAccountProfile.ts`
- `src/features/account/useOnboardingPreferences.ts`
- `src/features/account/useAppPreferences.ts`
- `src/features/account/useNotificationPreferences.ts`
- `src/features/account/index.ts`
- Batch 1 documentation files

## Existing Tables Found

- `profiles`
- `profile_settings`
- `profile_modules`
- `profile_widgets`
- `user_settings`
- `user_feature_preferences`
- `device_tokens`
- `emergency_contacts`

Missing canonical Batch 1 tables:

- `onboarding_preferences`
- `app_preferences`
- `notification_preferences`

## Migration Draft

Created one additive migration draft for missing Batch 1 tables and profile metadata columns. It was not applied.

## RLS Policy Draft

Owner-only RLS policies were drafted for the new preference tables. Existing profile/preference tables already had owner-only policies in prior migrations.

## Generated Types Status

Generated Supabase types are missing. Local domain types were created and generated type regeneration is deferred.

## Account Domain Types

Created account profile, onboarding preference, app preference, notification preference, backend status, and service result types.

## Account Service Status

Created service methods for auth user, profile, onboarding, app preferences, and notification preferences. Missing draft tables return `missingTable`.

## Account Hooks Status

Created hooks for account profile, onboarding preferences, app preferences, and notification preferences. Hooks do not auto-upsert on render.

## UI Connection Status

- Profile/Settings: existing safe reads remain; new draft-table writes are deferred.
- Onboarding: existing local/profile-sync behavior remains; new backend preference writes are deferred.
- Home/Shell: no change in this batch.

## Profile Photo Metadata

Existing profile avatar storage bucket and policies exist. Draft migration adds `avatar_storage_path`, but active UI still avoids exposing raw storage paths.

## Notification Preferences

Draft table stores preferences only. No notification permissions, scheduling, push tokens, or push backend were added.

## Deferred Items

- Applying migration.
- Generating Supabase database types.
- Wiring Settings writes to `app_preferences` and `notification_preferences`.
- Wiring Onboarding writes to `onboarding_preferences`.
- Push notification backend.
- Profile photo upload UX changes.

## Typecheck Result

- First `npm run typecheck` failed with existing TS2590 route-union errors and two account-service validation type errors.
- The specific reported errors were patched.
- The permitted single rerun failed with one remaining account-service validation type error.
- That final reported error was patched.
- Typecheck was not run a third time to respect the instruction not to repeatedly run commands.

## Risks / Blockers

- Draft migration not applied.
- Generated DB types missing.
- Current onboarding still requests notification permission locally; backend preference table does not alter that behavior.
- Existing `profiles` shape uses `id = auth.uid()` rather than a separate `user_id`.

## Next Recommended Backend Batch

Batch 2: care subject profiles, after Batch 1 migration and generated types are accepted.
