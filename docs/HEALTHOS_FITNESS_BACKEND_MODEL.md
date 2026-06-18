# HealthOS Fitness Backend Model

## Supported In Batch 9

- Save private fitness goals.
- Save draft or reviewed workout plans.
- Log workout sessions.
- Log exercises and sets.
- Store muscle focus metadata.
- Store progress notes.
- Keep AI/record-derived plans as `needs_review`.

## Safety Rules

- No guaranteed outcomes.
- No fake workouts, streaks, personal bests, or muscle heat maps.
- No injury rehabilitation or pregnancy workout prescriptions.
- Calendar/reminder links are review-first and not auto-scheduled.

## Existing Compatibility

Existing `user_imported_plans` remains available for the current AI import flow. The new `workout_plans.legacy_imported_plan_id` can bridge old imports later without destructive migration.
