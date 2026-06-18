# HealthOS Supabase Generated Types Coverage

Date: 2026-06-18

## Generated Type Location

No full Supabase-generated `Database` type file was found in the inspected expected locations:

- `src/types/database.types.ts`
- `src/types/supabase.ts`
- `src/lib/database.types.ts`
- `src/lib/supabase.types.ts`
- `src/generated/database.types.ts`
- `database.types.ts`
- `supabase/database.types.ts`
- `types/supabase.ts`

The only local database type file found was `src/types/database.ts`. It is a manual profile-focused type file, not a generated Supabase schema type file.

## Tables Present In Generated Types

None confirmed. Because no generated `Database` type file exists, no planned MVP table can be marked present in generated types.

Manual profile-equivalent coverage exists in `src/types/database.ts` for profile-shaped rows, but this is not generated Supabase table coverage.

## Tables Missing From Generated Types

All planned MVP backend tables are missing from generated types until migrations are applied to the target Supabase project and types are regenerated.

## Coverage By Batch

| Batch | Area | Generated Type Status | Tables |
| --- | --- | --- | --- |
| 1 | Account/Profile | missing | `profiles`, `onboarding_preferences`, `app_preferences`, `notification_preferences`, `profile_photo_metadata` |
| 2 | Care Profiles | missing | `care_profiles`, `care_profile_relationships`, `active_care_profile_preferences`, `caregiver_profiles` |
| 3 | Family Sharing | missing | `family_circles`, `family_circle_members`, `family_invites`, `sharing_permissions`, `caregiver_assignments`, `family_shared_updates` |
| 4 | Records | missing | `records`, `record_files`, `record_links`, `record_extractions`, `emergency_packet_items` |
| 5 | Calendar/Reminders | missing | `calendar_events`, `calendar_event_links`, `reminders`, `reminder_history`, `notification_events` |
| 6 | Medication/Supplements | missing | `medications`, `medication_schedules`, `medication_logs`, `medication_side_effect_notes`, `medication_refill_reminders`, `supplements`, `supplement_schedules`, `supplement_logs`, `medication_review_flags` |
| 7 | Life Stage Health | missing | `pregnancy_profiles`, `pregnancy_logs`, `pregnancy_appointments`, `pregnancy_checklists`, `pregnancy_care_team`, `women_health_logs`, `contraception_logs`, `sex_day_logs`, `child_care_logs`, `feeding_logs`, `sleep_logs`, `diaper_logs`, `growth_measurements`, `vaccine_records`, `milestone_logs`, `solids_logs`, `child_medication_notes`, `caregiver_notes` |
| 8 | AI Import | missing | `ai_extraction_jobs`, `ai_import_envelopes`, `ai_review_events`, `ai_source_evidence`, `ai_conversations`, `ai_messages` |
| 9 | Fitness/Nutrition | missing | `fitness_goals`, `workout_plans`, `workout_sessions`, `exercise_logs`, `exercise_set_logs`, `muscle_focus_logs`, `fitness_progress_notes`, `nutrition_goals`, `meal_logs`, `meal_items`, `food_items`, `meal_plans`, `grocery_lists`, `grocery_list_items`, `hydration_logs`, `nutrition_review_flags` |
| 10 | Trusted Content | missing | `trusted_content_sources`, `trusted_content_items`, `trusted_content_targeting`, `saved_content_items`, `content_read_history`, `content_feedback` |

## Type Regeneration Todo

After the backend migration sequence is applied to the target Supabase project, regenerate Supabase types into a dedicated generated file such as `src/types/database.types.ts`. Do not replace manual domain types until service call sites have been updated to consume the generated `Database` shape safely.
