# HealthOS Native Permissions Audit

Date: 2026-06-18

## Configured Permissions / Plugins

- Camera: `expo-camera` plugin with camera permission copy and barcode scanner enabled.
- Photos/camera picker: `expo-image-picker` plugin with permission copy; microphone permission disabled.
- Notifications: `expo-notifications` plugin and Android `POST_NOTIFICATIONS`.
- Secure storage: `expo-secure-store`.
- Local authentication: package installed and used by security settings.
- Pedometer/sensors: package installed and used by fitness step count.
- Document picker: package installed and used for AI and record upload flows.

## User-Action Permission Requests

- Scan route requests camera permission from the scan screen.
- Food barcode scanner requests camera permission from the scanner screen.
- Profile image flow requests camera or gallery permission based on user choice.
- Nutrition image flow requests gallery permission by user action.
- Notification permission is requested from onboarding or notification settings by user choice.
- Pedometer permission is requested through step count access.

## Development Build Notes

Notifications are explicitly degraded on Android Expo Go because `expo-notifications` device delivery requires a dev/release build for the relevant runtime path.

## Readiness Status

Partial. Permission code paths are present, but real-device QA is still required for grant, deny, blocked, settings-open, and lock-screen privacy behavior.

