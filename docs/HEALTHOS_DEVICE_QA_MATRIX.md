# HealthOS Device QA Matrix

## Android

| Device class | Mode | Required | Focus |
| --- | --- | --- | --- |
| Low-end Android phone | Development build | Yes | Slow scroll, memory, camera, image previews, keyboard forms |
| Mid-range Android phone | Expo Go | Yes | Broad navigation, dark/light mode, layout |
| Current Android phone | Development build | Yes | Permissions, notifications, camera, app resume |
| Android tablet | Preview/release later | No | Tablet layout and max-width behavior |

## iOS

| Device class | Mode | Required | Focus |
| --- | --- | --- | --- |
| Older supported iPhone | Development build | Yes | Memory, launch, camera, keyboard, scroll |
| Current iPhone | Development build | Yes | Native behavior, permissions, notification taps |
| Small-screen iPhone | Expo Go | Yes | Keyboard overlap, readable text, bottom nav |
| Large-screen iPhone | Expo Go | Yes | Centered layout and spacing |
| iPad | Preview/release later | No | Tablet polish after MVP |

## Expo Go Checks

- General navigation through Home, Calendar, Scan, Health, Family.
- Deep realm route loading.
- Dark/light mode readability.
- Basic forms and keyboard behavior.
- Empty states and placeholder honesty.

## Development Build Checks

- Camera and gallery permissions.
- Local/push notification behavior.
- Notification tap routing to reminders.
- Biometrics/app lock behavior.
- App resume/background behavior.
- Native module parity with store-like runtime.

## Preview/Release Build Later

- Startup crash checks.
- Asset loading.
- Store permission prompts.
- Production API/environment configuration.
- Final memory and device performance.

## Required Test Cases

- Permission denied: camera, photos, notifications, biometrics.
- Offline/poor network: Supabase unavailable, AI backend unavailable, image upload failed.
- Slow device: Home, Calendar, AI, Records, Trusted Content, Fitness, Nutrition, Reminders.
- Camera/scan: no permission, permission granted, gallery import, retake, review-first import.
- Notifications: permission denied, permission granted, scheduled reminder, lock-screen privacy, tap routing.
- Accessibility: large font, screen reader labels, disabled button copy.
- Subscription: placeholder only until billing is implemented.
