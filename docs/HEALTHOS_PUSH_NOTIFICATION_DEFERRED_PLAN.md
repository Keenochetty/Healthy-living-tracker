# HealthOS Push Notification Deferred Plan

Date: 2026-06-17

## Deferred Items

- Push token registration.
- Push token storage changes.
- Expo push send calls.
- Push sending edge function.
- Server-side scheduling jobs.
- APNs/FCM credential handling.
- Push delivery audit trail.

## Current Batch 5 Boundary

Batch 5 supports local notification readiness only. It records reminder metadata and privacy-safe in-app notification events, but does not send remote notifications.

## Future Requirements

A later push batch should define:

- explicit user consent flow,
- token lifecycle and revocation,
- private token RLS/storage,
- backend job scheduler,
- privacy-safe title/body enforcement,
- delivery status and retry model,
- development build requirements,
- Expo Go limitations,
- production credentials and release risk.
