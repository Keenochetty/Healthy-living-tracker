# HealthOS Final Blockers Before Build

Date: 2026-06-18

## Blocking For Development Build

- Missing `expo.android.package`.
- Missing `expo.ios.bundleIdentifier`.
- Missing app icon.
- Missing splash config.
- Missing EAS project ID/linkage.
- Real environment values are not configured in this repo.
- `npx expo-doctor` has not been run by instruction.

## Blocking For Backend Confidence

- Generated Supabase types are missing.
- Migrations have not been applied in this step.
- RLS actor tests have not been run.
- Storage bucket/policy tests have not been run.
- Edge Function deployments have not been verified.
- Edge Function secrets have not been verified.

## Blocking For MVP Release Confidence

- Real-device camera, gallery, document upload, notification, auth, and deep-link tests are not complete.
- Store metadata and privacy disclosures are not final.
- Account deletion and data export flows need real environment verification.
- Sensitive notification lock-screen behavior needs real-device verification.

## Fixed In Step 40

- Added `eas.json`.
- Added `.env.example` placeholder for `EXPO_PUBLIC_FITNESS_AI_SEARCH_URL`.
- Confirmed `npm run typecheck` passes.

