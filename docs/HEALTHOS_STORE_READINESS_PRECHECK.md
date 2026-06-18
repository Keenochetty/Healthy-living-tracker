# HealthOS Store Readiness Precheck

Date: 2026-06-18

## Current Status

Not store-ready.

## Required Before Store Submission

- Add final Android package name.
- Add final iOS bundle identifier.
- Add app version, Android version code, and iOS build number.
- Add icon.
- Add splash config.
- Link EAS project.
- Confirm app display name.
- Confirm privacy policy URL.
- Confirm terms URL.
- Confirm support URL/email.
- Confirm account deletion path.
- Confirm data export path.
- Confirm health-data collection/use declarations.
- Confirm AI feature disclosures.
- Confirm notification privacy behavior.
- Confirm camera/photo/document permission copy.
- Confirm no real secrets are bundled in client code.
- Run real-device QA.
- Run RLS/storage actor tests against local/staging Supabase.
- Verify Edge Function deployments and secrets.

## Store Risk Notes

This app handles sensitive health and family/caregiver data. Store metadata and privacy declarations must be reviewed against the actual backend behavior before submission.

