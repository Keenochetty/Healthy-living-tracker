# HealthOS Medication + Supplements RLS

Date: 2026-06-17

## Policy Approach

Batch 6 adds owner-only policies to canonical medication/supplement tables. It does not grant access from family membership alone.

## Draft Policies Created

Owner-only select, insert, update, and delete policies were drafted for:

- `medications`
- `medication_schedules`
- `medication_logs`
- `medication_side_effect_notes`
- `medication_refill_reminders`
- `supplements`
- `supplement_schedules`
- `supplement_logs`
- `medication_review_flags`

Each policy combines `TO authenticated` with `owner_user_id = auth.uid()`.

## Existing Policies Found

The older `medications` table has legacy family/caregiver policies:

- family users can manage medications by family access,
- caregivers can read shared medications based on caregiver child access.

Batch 6 does not remove those policies to avoid breaking legacy code, but they remain a hardening risk.

## Shared/Caregiver Access

Explicit shared/caregiver medication summaries remain deferred. Family membership alone is not enough because medication names, schedules, side-effect notes, refill reminders, and supplement details are sensitive health data.
