# HealthOS Life-Stage Schema

Date: 2026-06-17

## Canonical Decision

Batch 7 creates a new additive migration for canonical life-stage metadata tables:

- `pregnancy_profiles`
- `pregnancy_logs`
- `pregnancy_appointments`
- `pregnancy_checklists`
- `pregnancy_care_team`
- `women_health_logs`
- `contraception_logs`
- `sex_day_logs`
- `child_care_logs`
- `feeding_logs`
- `sleep_logs`
- `diaper_logs`
- `growth_measurements`
- `vaccine_records`
- `milestone_logs`
- `solids_logs`
- `child_medication_notes`
- `caregiver_notes`

## Existing Equivalent Tables

Only documentation-only drafts were found for the older realm tables:

- `docs/pregnancy-phase-15b-schema.sql`: `pregnancy_profiles`, `pregnancy_appointments`, `pregnancy_symptom_logs`, `pregnancy_questions`, `pregnancy_share_permissions`.
- `docs/womens-health-phase-15a-schema.sql`: `womens_health_settings`, `cycle_profiles`, `period_logs`, `womens_symptom_logs`, `mood_energy_logs`, `contraception_methods`, `contraception_logs`.
- `docs/baby-child-phase-15c-schema.sql`: `baby_child_profiles`, `baby_feeding_logs`, `baby_sleep_logs`, `baby_diaper_logs`, `baby_growth_logs`, `baby_milestone_logs`, `baby_solid_food_logs`, `baby_medicine_logs`, `baby_vaccine_records`.

The active Supabase migration chain did not contain Batch 7 canonical tables before this pass.

## Ownership

Batch 7 tables use `owner_user_id` for RLS ownership. Subject-scoped rows use `subject_care_profile_id` where applicable. Pregnancy child tables use `pregnancy_profile_id`.

## Links

Record links are represented by `source_record_id` where the row has a clear record source. Reminder/calendar links are represented by `linked_reminder_id` and `linked_calendar_event_id` where safe.

## Generated Types

`src/types/database.ts` does not include Batch 7 tables. Frontend code uses domain types until Supabase generated types are regenerated after migration application.
