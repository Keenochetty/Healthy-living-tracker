# HealthOS Expo + EAS Config Audit

Date: 2026-06-18

## Expo Config

Primary config file: `app.json`.

Configured:

- `name`: `Family Health`
- `slug`: `family-health`
- `scheme`: `familyhealth`
- `orientation`: `portrait`
- `userInterfaceStyle`: `automatic`
- `experiments.typedRoutes`: `true`
- Plugins: Expo Router, localization, image picker, camera, secure store, datetime picker, audio, notifications, font, asset, web browser.
- Android permission: `POST_NOTIFICATIONS`.

Missing or incomplete:

- `version`
- `icon`
- `splash`
- `android.package`
- `android.versionCode`
- `ios.bundleIdentifier`
- `ios.buildNumber`
- `extra.eas.projectId`
- Runtime/update policy
- Store/legal URLs

## EAS Config

Created `eas.json`.

Profiles:

- `development`: development client, internal distribution.
- `preview`: internal distribution.
- `production`: placeholder profile only.

## Build Status

The EAS profile gap is fixed, but the app is still not build-ready because native package identifiers and install/launch assets are missing.

