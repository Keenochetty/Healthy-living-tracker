# Release Readiness Checklist

## Privacy And Security
- No private data leaks across profiles.
- Sensitive modules are private by default.
- Device Sync is never shared automatically.
- Family/caregiver permission tests pass.
- Supabase RLS/security assumptions reviewed.
- Private storage rules prepared for records/files.
- POPIA/privacy wording prepared.
- Terms/privacy policy placeholders exist.
- Export/delete data plan prepared.

## Health Safety
- Medical disclaimer visible.
- Emergency disclaimer visible.
- AI refuses diagnosis, prescribing, dosing, lab interpretation, pregnancy diagnosis, contraception safety claims, baby development interpretation, and hidden profile access.
- Medication/supplement safety wording avoids safe/unsafe or interaction decisions.
- Trusted content sources are visible and high-risk content is source-backed.

## Reliability
- TypeScript passes.
- Lint reviewed and unrelated/generated failures documented.
- QA runner passes.
- Build/export passes.
- In-app reminders and local notifications work.
- Sensitive notification privacy works.
- Calendar overlays are permission-aware.
- Data calculations tested with fixtures.
- Offline/manual logging paths work.

## Manual Sign-Off
- Onboarding
- Health Overview
- Calendar month and date bottom sheet
- Nutrition
- Workout
- Biometrics
- Medication
- Supplements
- Records
- Women’s Health
- Pregnancy
- Baby / Child
- Men’s Health
- Family/Caregiver
- AI Assistant
- Trusted Content
- Notification Settings
