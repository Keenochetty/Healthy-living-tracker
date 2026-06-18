# HealthOS Final Build Commands For User

Date: 2026-06-18

These commands were not run in Step 40, except for typecheck. Run them manually only after the remaining blockers are resolved.

## Already Run In Step 40

```bash
npm run typecheck
```

Result: passed.

## Next Diagnostic After Native Config Is Fixed

```bash
npx expo-doctor
```

## Start Development Client Locally After A Dev Build Exists

```bash
npx expo start --dev-client
```

## Android Development Build

Run only after `android.package`, app assets, EAS project linkage, and environment setup are complete.

```bash
eas build --profile development --platform android
```

## iOS Development Build

Run only after `ios.bundleIdentifier`, app assets, EAS project linkage, Apple credentials, and environment setup are complete.

```bash
eas build --profile development --platform ios
```

## Full Release Builds

Do not run until real-device QA, RLS/storage actor tests, Edge Function verification, and store readiness are complete.

```bash
eas build --profile production --platform android
eas build --profile production --platform ios
```

