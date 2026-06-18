# HealthOS Backend Migration Sequence

Date: 2026-06-17

## Rule

This is a migration sequence plan only. No migration SQL was created or applied in Phase 25.

| Order | Batch | Dependencies | Existing Tables | Planned Target Tables | RLS Required | Storage Required | Type Update | UI Unlocked | Risk | MVP |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | `account_preferences` | None | `profiles`, `user_settings`, `profile_settings`, `profile_modules`, `profile_widgets`, `user_feature_preferences`, `device_tokens` | `notification_preferences`, `app_preferences` | Owner-only profile/preferences | Avatar policy decision | Yes | Profile, Settings, Onboarding, Home personalization | Low | Yes |
| 2 | `care_subject_profiles` | account preferences | `profiles`, `children`, `caregiver_profiles` | `care_profiles`, `person_profiles`, self links | Owner, guardian, subject | None | Yes | Health Hub profile context, Child/Baby, Pregnancy, Family detail | High | Yes |
| 3 | `family_permissions` | care subjects | `families`, `family_members`, `family_memberships`, `family_invites`, `sharing_permissions`, `caregiver_child_access` | `family_circles`, `family_circle_members`, `family_permissions` if selected | Membership, explicit permissions, caregiver scope | None | Yes | Family Circle, Caregiver, shared records/calendar | Blocker | Yes |
| 4 | `records_storage_metadata` | family permissions | `health_records`, `documents`, `medical_records`, `medical_documents` | `record_files`, `record_links`, `record_extractions` | Owner plus explicit shared record permission | Private records bucket, signed URLs | Yes | Records, Scan to Records, documents | Blocker | Yes |
| 5 | `calendar_reminders` | family permissions | `calendar_events`, `event_responses`, `reminders`, `notifications`, `device_tokens` | `reminder_history` | Event visibility, reminder owner, notification recipient | None | Yes | Calendar, Reminder Center, medication reminders | High | Yes |
| 6 | `medication_supplements` | records, reminders | `medications`, `medicine_logs`, `reminders` | medication schedules/logs/refills/side effects, supplements schedules/logs | Owner/private-by-default plus explicit sharing | Label buckets if enabled | Yes | Medication, Supplements, prescription scan review | High | Yes |
| 7 | `life_stage_health` | care subjects, family permissions | `children`, `activity_logs`, `care_instructions`, `activity_photos`, `caregiver_child_access` | pregnancy, cycle, baby/child log tables | Private subject, guardian, caregiver scoped | Baby/child and pregnancy buckets if enabled | Yes | Pregnancy, Women's Health, Baby/Child | Blocker | Yes |
| 8 | `ai_import_review` | records, reminders | `app_ai_*`, `healthsync_ai_*` | `ai_extraction_jobs`, `ai_import_envelopes`, `ai_review_events` | Owner-only AI import | AI temp uploads | Yes | AI import cards, Scan review, Records extraction | High | Yes |
| 9 | `fitness_nutrition` | AI import review | imported plan/history/muscle tables | fitness reference/log tables, nutrition logs/meals/plans | Owner-only lifestyle plus reference read policies | Food image bucket if enabled | Yes | Fitness, Nutrition, meal/workout imports | High | Yes |
| 10 | `trusted_content` | account preferences | None confirmed | `trusted_content`, `content_sources`, `saved_content` | Public reference read, owner-saved, admin write | Licensed content images if enabled | Yes | Trusted Content, save/read-later | Medium | No |

## Generated Type Update Points

Regenerate database types after each applied migration batch in a future implementation phase, then update service row/insert/update types before connecting UI writes.

## Notes

- Avoid mega-migrations.
- Every batch must be additive and reviewable.
- UI writes stay disabled until table, RLS, generated types, service, empty state, error state, and privacy copy are ready.

