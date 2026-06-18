# HealthOS Navigation Reachability Audit

Date: 2026-06-18

## Bottom Nav Contract

`src/components/healthos/shell/healthOSNavConfig.ts` defines exactly five visible nav items:

- Home -> `/(tabs)/today`
- Calendar -> `/(tabs)/calendar`
- Scan -> `/(tabs)/scan`
- Health -> `/(tabs)/health`
- Family -> `/(tabs)/circle`

Settings, Profile, Baby/Child, Fitness, Food/Nutrition, Women's Health, Pregnancy, Medication, Supplements, and Records are not bottom nav items.

## Route Presence

Present active route groups include:

- `(tabs)`, `ai`, `auth`, `baby-child`, `biometrics`, `caregiver`, `child`, `circle`, `cycle`, `dev`, `device-sync`, `elder`, `fitness`, `food`, `health`, `health-calendar`, `join`, `medication`, `mens-health`, `onboarding`, `pregnancy`, `profile`, `records`, `reminders`, `settings`, `supplements`, `trusted-content`.

Missing or renamed compared with the request list:

- `src/app/calendar/` is not present; the active calendar route is `src/app/health-calendar/index.tsx` plus `src/app/(tabs)/calendar.tsx`.
- `src/app/womens-health/` is not present; women’s health is routed through `cycle`, `mens-health`, and health realm components.
- `src/app/nutrition/` is not present; nutrition is routed through `food`.
- `src/app/family/` is not present; family is routed through `circle`.
- `src/app/notifications/` is not present; notification/reminder surfaces are under `reminders`, `settings/notifications`, and HealthOS notification components.

## Deep Realm Reachability

Deep realms remain reachable through Health Hub, Home widgets, Records links, Calendar context, AI import review, or Family context where permission allows. Generated Supabase types and backend table verification remain blockers for full live-data reachability.

