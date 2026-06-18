# HealthOS UI Backend Connection Sequence

Date: 2026-06-17

## Rule

Connect UI writes only after the table, RLS, generated types, service handler, empty state, error state, and privacy copy are ready.

| Order | Route / Feature | Backend Dependency | Service | Tables Required | Can Connect Now | Placeholder OK | Privacy Required | MVP Blocker |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Auth/Profile/Settings | `account_preferences` | Profile service | `profiles`, settings tables | Partial | No | Yes | Yes |
| 2 | Onboarding preferences | `account_preferences` | Onboarding/preferences service | profile module/widget/preference tables | Partial | No | Yes | Yes |
| 3 | Health Hub profile context | `care_subject_profiles` | Care profile service | profile/care subject tables | No | No | Yes | Yes |
| 4 | Family circle basics | `family_permissions` | Family circle service | family/membership/invite tables | Partial | No | Yes | Yes |
| 5 | Records metadata | `records_storage_metadata` | Records service | `health_records`, `record_files`, `record_links` | No | No | Yes | Yes |
| 6 | Scan to Records draft | records + AI import | AI import service | AI job/import and record file tables | No | No | Yes | Yes |
| 7 | Medication/Supplements reviewed save | `medication_supplements` | Medication/supplement service | medication/supplement schedule/log tables | No | No | Yes | Yes |
| 8 | Calendar/Reminders | `calendar_reminders` | Calendar/reminder service | events/reminders/history | Partial | No | Yes | Yes |
| 9 | Pregnancy profile/logs | `life_stage_health` | Pregnancy service | pregnancy tables | No | No if in MVP | Yes | Yes |
| 10 | Baby/Child profile/logs | `life_stage_health` | Baby/child service | child log tables | No | No if in MVP | Yes | Yes |
| 11 | Women's Health private logs | `life_stage_health` | Women's health service | cycle/private log tables | No | No if in MVP | Yes | Yes |
| 12 | AI Import Review storage | `ai_import_review` | AI import service | import envelopes/review events | No | No | Yes | Yes |
| 13 | Nutrition logs/meal plans | `fitness_nutrition` | Nutrition service | nutrition tables | No | No if in MVP | Yes | Yes |
| 14 | Fitness logs/plans | `fitness_nutrition` | Fitness service | fitness tables | Partial | No if in MVP | Yes | Yes |
| 15 | Trusted Content/saved content | `trusted_content` | Trusted content service | trusted/saved content tables | No | Yes | Yes | No |
| 16 | Notifications/push token later | notifications backend | Notifications service | notifications/device tokens/preferences | No | Yes | Yes | No |

## Empty And Error State Requirements

Every connected feature must show honest empty/error states and must not seed fake user data to hide missing backend work.

