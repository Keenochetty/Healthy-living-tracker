# HealthOS Baby / Child Backend Model

Date: 2026-06-17

## Tables

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

## Rules

Rows are parent/guardian managed through `owner_user_id` and `subject_care_profile_id`.

Growth rows are measurements only. No percentile engine was added.

Vaccine rows are record metadata only. No vaccine recommendation engine or universal schedule was added.

Milestone rows are observations only. They are not diagnoses.

Child medication notes do not calculate or recommend doses.

Caregiver notes are limited metadata and do not grant full child health access.
