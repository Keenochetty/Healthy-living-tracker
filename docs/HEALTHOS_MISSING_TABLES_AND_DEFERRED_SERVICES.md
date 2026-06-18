# HealthOS Missing Tables And Deferred Services

Date: 2026-06-18

## Root Cause

No Supabase-generated `Database` type file is present in the repo. The planned backend migrations exist locally, but Step 36 explicitly did not apply migrations or regenerate remote types.

## Deferred Service Areas

The following areas have service layers but cannot be considered fully type-safe against generated Supabase tables yet:

- Account/Profile preferences
- Care profiles and relationships
- Family circles, invites, sharing permissions, and caregiver assignments
- Records, record files, record links, record extraction metadata, and emergency packet metadata
- Calendar events, event links, reminders, reminder history, and notification events
- Medication, supplements, schedules, logs, side effects, refill reminders, and review flags
- Pregnancy, women's health, baby/child logs, growth, vaccines, milestones, and caregiver notes
- AI import envelopes, extraction jobs, review events, source evidence, conversations, and messages
- Fitness goals, workouts, exercise logs, nutrition goals, meals, groceries, hydration, and review flags
- Trusted content sources, content items, targeting, saved content, read history, and feedback

## Services With Known Unsafe/Deferred Characteristics

- `src/features/fitnessNutrition/fitnessNutritionService.ts` uses domain types and table-name casting because generated types are missing.
- `src/features/trustedContent/trustedContentService.ts` uses domain types and table-name casting because generated types are missing.
- `src/features/aiImport/aiImportService.ts` uses domain types and table-name casting because generated types are missing.
- `src/features/lifeStageHealth/lifeStageService.ts` uses dynamic table names for multiple life-stage resources.
- `src/features/account/accountService.ts` uses dynamic preference table access.
- `src/features/medicationSafety/medicationService.ts`, `src/features/calendarReminders/calendarReminderService.ts`, `src/features/records/recordService.ts`, `src/features/familySharing/familySharingService.ts`, and `src/features/careProfiles/careProfileService.ts` target planned tables that are not present in generated types.
- Legacy modules under `src/lib` and `src/services` still contain direct `.from()` calls and remain route-dependent.

## Safe Handling Rule

Until generated types exist, services should use shared backend helpers from `src/features/backend` to return `missingTypes`, `missingTable`, or `deferred` where practical.

## Dependency To Become Ready

1. Apply/verify the planned backend migration sequence against the intended Supabase environment.
2. Regenerate Supabase database types.
3. Update table registry entries from `missing` to `present`.
4. Replace table casts/dynamic calls with generated typed access.
5. Rewire routes gradually, one feature area at a time.
