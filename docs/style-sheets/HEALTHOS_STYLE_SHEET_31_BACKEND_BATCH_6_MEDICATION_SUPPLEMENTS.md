# HealthOS Style Sheet 31 - Backend Batch 6: Medication + Supplements Foundation

## Purpose

Backend Batch 6 defines the medication and supplements foundation for HealthOS.

It covers medication metadata, supplement metadata, schedules, logs, side-effect notes, refill reminder metadata, record links, reminder links, review/caution prompts, safe copy, owner-only RLS draft, service methods, and hooks.

## Safety Boundary

HealthOS organizes medication and supplement information only. It must not prescribe, recommend dosage, adjust dosage, diagnose side effects, confirm interactions as final clinical facts, or replace a pharmacist, doctor, nurse, pediatrician, or healthcare professional.

## Batch Rules

- AI/Scan/record-derived entries start as `draft` and `needsReview`.
- Schedules represent intent only and do not schedule OS notifications.
- Reminder links require reviewed schedules.
- Medication/supplement names are not used in lock-screen copy by default.
- Family/caregiver visibility is private by default and requires explicit permission later.
- Interaction checking, pharmacy ordering, medical aid lookup, push backend, and clinical recommendation engines are deferred.

## Verification

Run only:

```bash
npm run typecheck
```

Do not run remote Supabase commands, app builds, Expo export, EAS build, or package installs.
