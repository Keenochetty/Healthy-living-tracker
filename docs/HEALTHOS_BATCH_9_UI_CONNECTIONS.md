# HealthOS Batch 9 UI Connections

## Connected In This Batch

No existing Fitness or Nutrition screens were switched to the new Supabase-backed hooks.

Reason: current realm hooks use AsyncStorage-backed helpers and local placeholder libraries. Replacing them during this backend batch would change active screen behavior and risk regressions outside the allowed scope.

## Ready For Later Wiring

The following hooks are ready under `src/features/fitnessNutrition`:

- `useFitnessGoals`
- `useWorkoutPlans`
- `useWorkoutSessions`
- `useExerciseLogs`
- `useNutritionGoals`
- `useMealLogs`
- `useMealPlans`
- `useGroceryLists`
- `useHydrationLogs`
- `useNutritionReviewFlags`

## UI Rules For Later

- Show honest empty states.
- Do not show fake workouts, meals, calories, macros, streaks, or muscle heat maps.
- Do not auto-activate AI/Scan candidates.
- Do not auto-schedule reminders.
