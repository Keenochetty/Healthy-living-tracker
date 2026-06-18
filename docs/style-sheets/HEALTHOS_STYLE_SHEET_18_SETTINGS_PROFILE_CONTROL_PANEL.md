# HealthOS Style Sheet 18 - Settings / Profile Control Panel

## Purpose

This style sheet defines the HealthOS Settings / Profile Control Panel. Settings is not a bottom nav destination. It is opened from the top header avatar/profile entry and contextual account actions.

## Scope

- Profile control panel route.
- Account profile hero.
- Profile photo action foundation.
- Personal information.
- Password and security.
- Device permissions.
- Notification settings.
- Privacy and sharing.
- Family/caregiver permissions summary.
- Subscription and billing foundation.
- Connected devices foundation.
- Appearance and preferences.
- Data, records, export, sign out, help/legal, and delete account foundation.

## Guardrails

- Do not add Settings to bottom nav.
- Do not redesign Home, Calendar, Scan, Health, Family, AI, Records, Medication, Pregnancy, Baby/Child, Nutrition, Fitness, or Women's Health.
- Do not fake profile, subscription, permission, connected device, or legal data.
- Do not upload profile photos without a safe storage handler.
- Do not implement billing or account deletion without a verified backend flow.
- Do not expose auth tokens, raw IDs, or storage paths.

## Visual Direction

- HealthOS shell and tokens.
- Glass profile card.
- Compact section cards.
- Icon and label rows.
- Clear privacy/security copy.
- Destructive actions separated in a danger zone.

## Navigation

Visible bottom nav remains Home, Calendar, Scan, Health, Family. Settings/Profile is reached through the top avatar/profile entry, profile cards, and contextual manage buttons.
