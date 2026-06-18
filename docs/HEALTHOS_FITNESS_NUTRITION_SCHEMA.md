# HealthOS Fitness + Nutrition Schema

Batch 9 migration draft: `supabase/migrations/20260617210000_healthos_batch_9_fitness_nutrition.sql`.

## Fitness Tables

- `fitness_goals`: private user-owned goal metadata.
- `workout_plans`: draft/reviewed workout plans, including AI/record candidate links.
- `workout_sessions`: planned or completed user-reported workout sessions.
- `exercise_logs`: exercises inside a workout session.
- `exercise_set_logs`: reps, weight, time, distance, and effort per exercise.
- `muscle_focus_logs`: muscle group focus metadata for future charts.
- `fitness_progress_notes`: user-entered progress notes.

## Nutrition Tables

- `nutrition_goals`: private user-owned nutrition goal metadata.
- `food_items`: reviewed or draft food/product metadata.
- `meal_logs`: meal-level logs.
- `meal_items`: food items inside a meal.
- `meal_plans`: draft/reviewed meal plan metadata.
- `grocery_lists`: user grocery list metadata.
- `grocery_list_items`: list items.
- `hydration_logs`: user-entered hydration amounts.
- `nutrition_review_flags`: caution and review prompts.

## Link Fields

The schema includes optional links to `care_profiles`, `records`, `ai_import_envelopes`, `calendar_events`, and `reminders`. These links do not grant access by themselves; underlying tables still enforce their own RLS.

## Deferred

Exercise catalogs, external food databases, macro engines, device integrations, and medical recommendation logic remain deferred.
