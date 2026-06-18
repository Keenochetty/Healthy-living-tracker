# HealthOS Backend Service Sequence

Date: 2026-06-17

## Service Order

| Order | Service | Batch | Tables | RLS Assumption | UI Consumers | MVP | Deferred |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Profile service | `account_preferences` | `profiles`, `user_settings`, `profile_settings` | Owner-only | Profile, Settings | Yes | No |
| 2 | Onboarding/preferences service | `account_preferences` | `profile_modules`, `profile_widgets`, `user_feature_preferences` | Owner-only | Onboarding, Home | Yes | No |
| 3 | Person/care profile service | `care_subject_profiles` | `profiles`, `children`, target care profiles | Owner/guardian | Health Hub, Family details | Yes | No |
| 4 | Family circle service | `family_permissions` | `families`, `family_memberships`, `family_invites` | Membership | Family Circle | Yes | No |
| 5 | Sharing permissions service | `family_permissions` | `sharing_permissions`, `caregiver_child_access` | Explicit permissions | Family, Caregiver, Records | Yes | No |
| 6 | Records service | `records_storage_metadata` | `health_records`, `record_files`, `record_links` | Owner/explicit permission | Records, Scan, realm documents | Yes | No |
| 7 | Storage service | `records_storage_metadata` | `record_files` | Metadata ownership | Records, Scan, Profile | Yes | No |
| 8 | Calendar/reminder service | `calendar_reminders` | `calendar_events`, `reminders`, `reminder_history` | Event/reminder owner | Calendar, Reminders | Yes | No |
| 9 | Medication/supplement service | `medication_supplements` | medication and supplement schedule/log tables | Private-by-default | Medication, Supplements | Yes | No |
| 10 | Pregnancy service | `life_stage_health` | pregnancy profile/log tables | Owner-only | Pregnancy | Yes | No |
| 11 | Baby/child service | `life_stage_health` | `children`, feeding/sleep/diaper/vaccine/growth logs | Guardian/caregiver scoped | Baby/Child, Caregiver | Yes | No |
| 12 | Women's health service | `life_stage_health` | cycle/symptom/private log tables | Owner-only | Cycle, Women's Health | Yes | No |
| 13 | AI import service | `ai_import_review` | AI jobs/import envelopes/review events | Owner-only | AI, Scan, Import Review | Yes | No |
| 14 | Fitness service | `fitness_nutrition` | fitness plans/sessions/logs/imports | Owner-only | Fitness | Yes | No |
| 15 | Nutrition service | `fitness_nutrition` | nutrition logs/meals/plans/foods | Owner-only | Food/Nutrition | Yes | No |
| 16 | Trusted content service | `trusted_content` | trusted content/source/saved tables | Public reference, owner-saved | Trusted Content | No | Yes |
| 17 | Notifications/push token service | `calendar_reminders` | notifications, device tokens, preferences | Recipient-only | Notifications, Settings | No | Yes |

## Service Requirements

- Use generated Supabase database types after type generation exists.
- Never use service role keys in client-side services.
- Do not bypass RLS.
- Return safe empty states when tables are missing.
- Do not invent data or fake persistence.
- Include error states before UI writes are enabled.

