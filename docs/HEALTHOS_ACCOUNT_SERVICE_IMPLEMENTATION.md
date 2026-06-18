# HealthOS Account Service Implementation

Date: 2026-06-17

## Files Created

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

## Service Methods

- `getCurrentAuthUser`
- `getAccountProfile`
- `ensureAccountProfile`
- `upsertAccountProfile`
- `getOnboardingPreferences`
- `upsertOnboardingPreferences`
- `markOnboardingComplete`
- `getAppPreferences`
- `upsertAppPreferences`
- `getNotificationPreferences`
- `upsertNotificationPreferences`

## Status Handling

Services return:

- `ready`
- `missingAuth`
- `missingTable`
- `deferred`
- `error`

Missing draft tables return `missingTable` instead of crashing UI.

## Safety

- The service uses the existing Expo Supabase client.
- No service role key is used.
- No fake data is created.
- No automatic upsert runs inside hooks.
- No raw Supabase error object is exposed to UI.

## Generated Types

Generated Supabase types are missing. The service therefore uses local domain types and tolerant row mappers until types are generated after migrations are applied.

