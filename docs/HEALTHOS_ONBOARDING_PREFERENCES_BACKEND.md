# HealthOS Onboarding Preferences Backend

Date: 2026-06-17

## Current State

The active onboarding UI currently stores setup state locally through `src/lib/onboardingStorage.ts` and syncs some profile preferences through existing profile sync helpers.

## Draft Table

The Batch 1 migration draft adds `onboarding_preferences` with:

- `user_id`
- `setup_completed`
- `selected_goals`
- `selected_modules`
- `gender_context`
- `life_stage_context`
- `family_setup_intent`
- `fitness_goal`
- `nutrition_goal`
- `pregnancy_interest`
- `baby_child_interest`
- `caregiver_interest`
- `daily_planning_interest`
- `skipped_steps`
- `completed_steps`

## Personalization Rules

- Onboarding stores preferences, not diagnosis.
- Gender and life-stage context are UI personalization inputs only.
- Men are not forced into pregnancy/cycle setup.
- Onboarding can be skipped.
- Device notification permission requests are not part of the new Batch 1 backend preference table.

## Connection Status

The `useOnboardingPreferences` hook exists, but active onboarding writes remain on the existing local/profile-sync path until the draft migration and generated types are applied.

