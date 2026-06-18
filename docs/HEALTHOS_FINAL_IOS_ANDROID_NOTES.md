# HealthOS Final iOS / Android Notes

Date: 2026-06-18

## Android

- Add a stable package name before build, for example `com.yourcompany.familyhealth`.
- Android `POST_NOTIFICATIONS` is declared.
- Notification channels are created at runtime for health reminders and private health reminders.
- Android Expo Go is not enough for notification delivery validation.
- Barcode/camera testing requires a real device or capable emulator.

## iOS

- Add a stable bundle identifier before build, for example `com.yourcompany.familyhealth`.
- Confirm camera/photo permission strings in the generated native project.
- Confirm notification prompt, provisional behavior, and lock-screen privacy.
- Confirm Apple credentials in EAS before iOS builds.

## Shared

- App icon and splash must be added before distributing builds to testers.
- Real-device QA should include denied permissions and settings recovery paths.

