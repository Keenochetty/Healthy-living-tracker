# HealthOS Realm Table Map

Date: 2026-06-17

## Scope

This map groups active HealthOS realms by current and target backend ownership. It is documentation and static helper alignment only; no Supabase schema was applied.

| Realm | Active Routes | Primary Tables | Secondary Tables | Storage | Edge Functions | AI Import Targets | Record Links | Reminder Targets | Privacy | Readiness |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Home | `/`, `/(tabs)/today` | `profile_widgets`, `reminders`, `health_records` | None | None | None | None | `health_records`, records | `reminders` | User private | Partial |
| Calendar | `/(tabs)/calendar`, `/health-calendar` | `calendar_events` | `event_responses`, `reminders` | None | None | `calendar` | records | `calendar_events`, `reminders` | Family shared | Partial |
| Scan | `/(tabs)/scan` | `app_ai_scan_results` | `healthsync_ai_imports` | `ai-temp-uploads` | `ai-extract`, `ai-document-extraction` | records, medication, nutrition | records | records | User private | Partial |
| Health Hub | `/(tabs)/health`, `/health/[realm]` | `health_records`, `health_logs` | `temperature_logs`, `doctor_visits`, biometrics target | None | None | records | `health_records` | reminders | Family shared | Partial |
| Family / Circle | `/(tabs)/circle`, `/circle/member/[memberId]` | `families`, `family_memberships`, `family_members` | `family_invites`, `sharing_permissions` | None | None | None | records | notifications | Family shared | Partial |
| AI | `/ai`, `/ai/import-review`, `/ai/review/[jobId]` | `healthsync_ai_sessions`, `healthsync_ai_imports` | `app_ai_chats`, `app_ai_messages`, `app_ai_imports`, `ai_plan_search_logs` | `ai-temp-uploads` | `ai-chat`, `ai-extract` | fitness, nutrition, medication, calendar, records, baby, cycle, pregnancy | records | reminders | User private | Partial |
| Fitness | `/(tabs)/fitness`, `/fitness/*` | `user_imported_plans`, `user_fitness_history` | `user_muscle_load_history`, `fitness_muscle_groups` | None | None | fitness | records | calendar events | User private | Partial |
| Nutrition / Food | `/(tabs)/food`, `/food/*` | `nutrition_logs`, `meals` | imported plans | `food-images` | `food-api-lookup`, `barcode-product-lookup` | nutrition, shopping list | records | reminders | User private | Schema missing |
| Medication | `/medication`, `/medication/[medicationId]` | `medications` | `medicine_logs`, `reminders` | `medication-labels-private` | `medication-supplement-lookup` | medication | records | reminders | Family shared | Partial |
| Supplements | `/supplements` | `supplements` | `reminders` | `supplement-labels-private` | `medication-supplement-lookup` | supplements | records | reminders | User private | Schema missing |
| Records | `/records` | `health_records`, `documents` | `medical_records`, `medical_documents` | `health-records-private`, `medical-documents` | `private-file-signed-url`, `ai-document-extraction` | records | records | reminders | User private | Storage missing |
| Pregnancy | `/pregnancy` | `pregnancy_profiles` | `calendar_events`, `health_records` | `pregnancy-records-private` | None | pregnancy | records | calendar events, reminders | User private | Schema missing |
| Baby / Child | `/baby-child`, `/child/*` | `children`, `activity_logs` | `care_instructions`, `activity_photos`, `caregiver_child_access` | `baby-records-private`, `activity-photos` | None | baby child | records | reminders | Child parent managed | Partial |
| Women's Health / Cycle | `/cycle` | `cycle_logs` | `calendar_events`, `health_records` | None | None | cycle | records | reminders | User private | Schema missing |
| Trusted Content | `/trusted-content` | `trusted_content`, `content_sources` | `saved_content` | None | `trusted-content-refresh` | None | None | None | Public reference plus user saved | Schema missing |
| Notifications / Reminders | `/reminders`, `/settings/notifications` | `reminders`, `notifications`, `device_tokens` | `reminder_history` target | None | None | calendar, medication | records | reminders | User private | Partial |
| Profile / Settings | `/profile/*`, `/settings/*` | `profiles`, `profile_settings`, `user_settings` | `profile_modules`, `profile_widgets`, `device_tokens`, `emergency_contacts` | `profile-avatars` | `data-export`, `delete-account` | None | records | notifications | User private | Partial |
| Auth / Onboarding | `/auth/*`, `/onboarding` | `auth.users`, `profiles`, `profile_settings` | `profile_modules`, `profile_widgets`, `user_feature_preferences` | None | None | None | None | None | User private | Auth ready, onboarding partial |
| Caregiver | `/caregiver/*` | `caregiver_profiles`, `caregiver_child_access` | `care_instructions`, `activity_logs` | `caregiver-uploads` | None | None | records | calendar events | Caregiver limited | Partial |
| Elder / Device / Biometrics | `/elder`, `/device-sync`, `/biometrics` | target tables only | `health_records` | None | None | None | records | reminders | User private or family shared | UI only |

## Table Grouping

- Account/profile: `profiles`, `users`, `user_settings`, `profile_settings`, `profile_modules`, `profile_widgets`.
- Family/permissions: `families`, `family_members`, `family_memberships`, `family_invites`, `sharing_permissions`.
- Child/caregiver: `children`, `caregiver_profiles`, `caregiver_child_access`, `care_instructions`, `activity_logs`, `activity_photos`.
- Records/files: `health_records`, `medical_records`, `documents`, `medical_documents`, target `record_files`, target `record_links`.
- Calendar/reminders/notifications: `calendar_events`, `event_responses`, `reminders`, target `reminder_history`, `notifications`, `device_tokens`.
- AI/import: `app_ai_chats`, `app_ai_messages`, `app_ai_imports`, `app_ai_actions`, `app_ai_scan_results`, `healthsync_ai_sessions`, `healthsync_ai_imports`, legacy `ai_chat_sessions`, `ai_messages`, `ai_actions`.
- Fitness: `user_imported_plans`, `user_imported_plan_days`, `user_plan_calendar_events`, `user_fitness_history`, `user_muscle_load_history`, `fitness_muscle_groups`.
- Missing realm schemas: nutrition, supplements, pregnancy, women's health/cycle, trusted content, elder, device sync, biometrics.

