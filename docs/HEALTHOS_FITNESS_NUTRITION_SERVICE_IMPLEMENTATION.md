# HealthOS Fitness + Nutrition Service Implementation

## Feature Folder

`src/features/fitnessNutrition`

Files:

- `fitnessNutritionTypes.ts`
- `fitnessNutritionDefaults.ts`
- `fitnessNutritionMappers.ts`
- `fitnessNutritionValidation.ts`
- `fitnessNutritionPrivacy.ts`
- `fitnessNutritionSafetyCopy.ts`
- `fitnessNutritionService.ts`
- Hook files for goals, plans, sessions, exercises, meals, grocery, hydration, and review flags.

## Service Behavior

- Uses the existing Expo Supabase anon client from `@/lib/supabase`.
- Does not use service-role keys.
- Returns `missingAuth` when no signed-in user is available.
- Returns `missingTable` for missing migration/table errors.
- Creates AI, scan, barcode, and record candidates as drafts requiring review.
- Does not auto-activate plans.
- Does not auto-schedule calendar events or reminders.

## Generated Types

`src/types/database.ts` does not include Batch 9 tables yet. The service uses domain types and `supabase.from(name as never)` to avoid breaking typecheck before Supabase type generation is rerun after migration application.
