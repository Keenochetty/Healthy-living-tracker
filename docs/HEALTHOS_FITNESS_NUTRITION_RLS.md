# HealthOS Fitness + Nutrition RLS

## Policy Shape

All Batch 9 tables are private by default. Rows use `owner_user_id` and policies compare it with `(select auth.uid())`.

Owner-managed tables:

- `fitness_goals`
- `workout_plans`
- `workout_sessions`
- `muscle_focus_logs`
- `fitness_progress_notes`
- `nutrition_goals`
- `food_items`
- `meal_logs`
- `meal_plans`
- `grocery_lists`
- `hydration_logs`
- `nutrition_review_flags`

Child tables also verify parent ownership on insert/update:

- `exercise_logs`
- `exercise_set_logs`
- `meal_items`
- `grocery_list_items`

## Not Included

- No public reads.
- No family access by membership alone.
- No caregiver access without explicit permission.
- No service-role client usage.

Family/caregiver sharing should be implemented in a later permission-aware pass using the established `sharing_permissions` model.
