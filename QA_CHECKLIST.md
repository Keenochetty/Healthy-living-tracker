# QA Checklist

Phase 22 checks whether the app is private, stable, source-backed, and safe enough for family health use.

## Core App Flows
- First launch routes to onboarding.
- Profile setup creates a self profile without enabling sensitive modules by default.
- Optional modules can be skipped and enabled later.
- Health main bar shows selected widgets only.
- AI Assistant, Device Sync, and Notifications are off until explained and explicitly enabled.
- Family setup can be skipped without blocking personal health use.

## Health Realms
- Health Overview loads with profile header, privacy status, widgets, realm cards, reminders, timeline preview, and setup completion card where needed.
- Nutrition, Workout, Biometrics, Device Sync, Medication, Supplements, Records, Calendar / Timeline, Women’s Health, Pregnancy, Baby / Child, Men’s Health, Family, AI, Trusted Content, Notifications, and Onboarding open without blank screens.
- Realm screens show focused headers, primary actions, internal tabs, empty states, and disclaimer footers where health-sensitive.

## Widgets And Navigation
- Floating bottom nav does not cover important controls.
- Baby droplet appears only when a visible baby/child profile exists or is pinned.
- AI floating button does not cover submit buttons.
- Health widgets recalculate after logs, profile switch, reminder actions, and pin/unpin/reorder.
- Hidden data never appears in widget labels, values, or routes.

## Data Integrity
- Nutrition totals match diary entries, recipes, saved meals, water logs, and targets.
- Workout volume, personal bests, and goals update from logged sessions only.
- Pregnancy week/day and trimester are labelled estimated.
- Cycle day and fertile/ovulation windows are labelled estimates.
- Baby age, feeding totals, sleep totals, diaper logs, and growth trends are based on logs only.
- Reminder recurrence, snooze, overdue, and reconciliation do not duplicate reminders.

## Safety And Wording
- No screen diagnoses, prescribes, interprets labs/scans, or labels health data safe/unsafe.
- Medication/supplement screens never recommend starting, stopping, changing, or dosing.
- Baby/child screens never label growth or milestones normal/abnormal/delayed.
- Women’s Health never shows safe-day guidance or contraception effectiveness claims.
- AI responses are draft-first and block medical instruction requests.

## Offline And Failure
- App opens without network.
- Manual logs remain local-first.
- Food API, barcode lookup, Supabase, trusted content, and document upload failures show friendly fallback states.
- In-app reminders work when device notification permission is denied.

## Accessibility
- Touch targets are at least 44px.
- Icon-only actions have accessibility labels.
- Text contrast is readable.
- Calendar halos include icon/pattern cues, not color alone.
- Empty, loading, error, and locked states are present.
