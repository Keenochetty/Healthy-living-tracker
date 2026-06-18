# Expo Go vs Development Build

## Expo Go Is Useful For

- Broad navigation testing.
- UI layout and dark/light mode.
- Basic React Native screen logic.
- Empty states.
- Static checklist/dev routes.

## Development Build Is Needed Or Strongly Preferred For

- Push/local notification permission behavior.
- Notification channel and lock-screen privacy checks.
- Native configuration parity.
- Camera and media-library behavior closer to store runtime.
- Biometrics/app-lock behavior.
- Production-like crash behavior.
- In-app purchases/subscriptions later.
- Final release QA.

## Rule

Expo Go is not enough for store readiness. Use it for broad UI iteration, then run development builds for native permissions, notifications, camera, biometrics, and final device QA.
