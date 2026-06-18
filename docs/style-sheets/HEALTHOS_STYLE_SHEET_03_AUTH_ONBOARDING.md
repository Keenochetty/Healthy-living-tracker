# HealthOS Style Sheet 03 - Auth + Onboarding

## Purpose

This style sheet defines the HealthOS authentication and onboarding experience. Auth and onboarding must feel premium, safe, calm, simple, trustworthy, family-friendly, and privacy-first.

This phase includes login styling, registration styling, email/password auth UI, Google and Apple entry points, forgot password, auth loading/error states, reordered onboarding, goal-selection pills, profile basics before goals, and basic privacy-first onboarding messaging.

This phase does not redesign Home, Calendar, Scan, Health, Family, Fitness, Nutrition, Women’s Health, Pregnancy, Medication, Records, or deep realm pages.

## Auth Direction

Login methods:

- Email/password
- Google
- Apple ID where supported/configured

Do not fake Google or Apple login. If provider logic is not configured, show a safe disabled/pending state or a clear inline message.

Auth screen structure:

```txt
Safe area screen
  HealthOS brand block
  Auth glass card
    Title/subtitle
    Inputs
    Forgot password
    Primary action
    Divider
    Social actions
    Create/sign-in switch
  Bottom privacy note
```

Auth screens must not show main app shell, top header, AI command bar, or floating bottom nav.

## Onboarding Order

The onboarding order is:

1. Setup purpose
2. Gender / profile basics
3. Goals / what they need help with
4. Privacy and sharing
5. Permissions
6. Finish / enter Home

Goals must not appear before gender/profile basics.

## Rules

- Use the HealthOS design system from `src/theme/healthos`.
- Use primitives from `src/components/healthos`.
- Preserve existing Supabase auth and onboarding persistence.
- Do not invent database columns.
- Do not request all permissions on screen load.
- Do not add medical diagnosis claims.
- Run typecheck only.
