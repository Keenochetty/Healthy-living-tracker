# HealthOS RLS Policy Audit Matrix

Date: 2026-06-18

## Scope

This matrix audits planned MVP tables from Batches 1-10 against local migration SQL only. No SQL was run and no remote Supabase state was inspected.

## Summary

RLS is confirmed in local SQL for most planned tables. Four planned tables were not confirmed in the Batch 1-10 migration files:

- `profile_photo_metadata`
- `caregiver_profiles`
- `ai_conversations`
- `ai_messages`

Generated Supabase types are still missing, so every item remains pending runtime verification.

## Matrix

| Batch | Table | Area | Sensitive | RLS | Policies Found | Owner Column | Subject Column | Family/Caregiver Access | Public Read | Risk | Status | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | `profiles` | account | yes | confirmed legacy | own profile policies | `id` | none | no | no | low | safe pending runtime | Existing profile RLS predates Batch 1. |
| 1 | `onboarding_preferences` | account | yes | confirmed | owner manage | `owner_user_id` | none | no | no | low | safe pending runtime | Owner-only preference table. |
| 1 | `app_preferences` | account | yes | confirmed | owner manage | `owner_user_id` | none | no | no | low | safe pending runtime | Owner-only preference table. |
| 1 | `notification_preferences` | account | yes | confirmed | owner manage | `owner_user_id` | none | no | no | low | safe pending runtime | Owner-only preference table. |
| 1 | `profile_photo_metadata` | account | yes | not confirmed | none found | unknown | none | no | no | medium | fix needed | Planned table not confirmed in local Batch 1 RLS. |
| 2 | `care_profiles` | careProfiles | yes | confirmed | owner/relationship policies | `owner_user_id` | `id` | relationship based | caregiver indirect | medium | deferred | Needs permission test verification. |
| 2 | `care_profile_relationships` | careProfiles | yes | confirmed | relationship policies | `owner_user_id`/relationship columns | `care_profile_id` | relationship based | no | medium | deferred | Needs actor tests. |
| 2 | `active_care_profile_preferences` | careProfiles | yes | confirmed | owner manage | `owner_user_id` | `care_profile_id` | no | no | low | safe pending runtime | Owner preference. |
| 2 | `caregiver_profiles` | careProfiles | yes | not confirmed | none found | unknown | unknown | unknown | no | medium | fix needed | Planned table not confirmed in Batch 2 RLS. |
| 3 | `family_circles` | familySharing | yes | confirmed | owner/member policies | `owner_user_id` | none | membership for circle metadata | no | medium | deferred | Membership must not imply medical access. |
| 3 | `family_circle_members` | familySharing | yes | confirmed | circle member policies | `owner_user_id`/`user_id` | none | membership metadata only | no | medium | deferred | Actor tests required. |
| 3 | `family_invites` | familySharing | yes | confirmed | invite policies | `owner_user_id`/email/token | none | invite-specific | no | medium | deferred | Token exposure should be tested. |
| 3 | `sharing_permissions` | familySharing | yes | confirmed | explicit permission policies | `owner_user_id` | `subject_care_profile_id` | explicit permission keys | no | low | safe pending runtime | Core gate for shared health data. |
| 3 | `caregiver_assignments` | familySharing | yes | confirmed | assignment policies | `owner_user_id` | `subject_care_profile_id` | explicit assignment | no | low | safe pending runtime | Must stay limited. |
| 3 | `family_shared_updates` | familySharing | yes | confirmed | shared update policies | `owner_user_id` | `subject_care_profile_id` | explicit permission expected | no | medium | deferred | Ensure no private details in updates. |
| 4 | `records` | records | yes | confirmed | owner + explicit record viewer read, owner write | `owner_user_id` | `subject_care_profile_id` | `view_records_shared`, `emergency_packet_view` | no | low | safe pending runtime | Good explicit permission pattern. |
| 4 | `record_files` | records | yes | confirmed | owner + explicit record viewer read, owner write | `owner_user_id` | via record | explicit record permission | no | low | safe pending runtime | Storage policy also required. |
| 4 | `record_links` | records | yes | confirmed | owner manage | `owner_user_id` | via record | no | no | low | safe pending runtime | Owner-only links. |
| 4 | `record_extractions` | records | yes | confirmed | owner manage | `owner_user_id` | via record | no | no | low | safe pending runtime | Review metadata only. |
| 4 | `emergency_packet_items` | records | yes | confirmed | owner manage | `owner_user_id` | `subject_care_profile_id` | no automatic public access | no | medium | deferred | Emergency sharing needs actor tests. |
| 5 | `calendar_events` | calendarReminders | yes | confirmed | owner/shared policies | `owner_user_id` | `subject_care_profile_id` | explicit sharing expected | no | medium | deferred | Shared calendar detail needs tests. |
| 5 | `calendar_event_links` | calendarReminders | yes | confirmed | owner/manage via event | via event | via event | no | no | medium | deferred | Link leakage test needed. |
| 5 | `reminders` | calendarReminders | yes | confirmed | owner policies | `owner_user_id` | `subject_care_profile_id` | explicit sharing expected | no | medium | deferred | Lock-screen title privacy is UI/service concern. |
| 5 | `reminder_history` | calendarReminders | yes | confirmed | owner via reminder/history | `owner_user_id` | via reminder | no | no | low | safe pending runtime | Private history. |
| 5 | `notification_events` | calendarReminders | yes | confirmed | owner policies | `owner_user_id` | optional | no | no | low | safe pending runtime | Should not expose OS notification body. |
| 6 | `medications` | medicationSafety | yes | confirmed | owner policies | `owner_user_id` | `subject_care_profile_id` | no by default | no | low | safe pending runtime | Medication private by default. |
| 6 | `medication_schedules` | medicationSafety | yes | confirmed | owner policies | `owner_user_id` | via medication/profile | no by default | no | low | safe pending runtime | Review-first required. |
| 6 | `medication_logs` | medicationSafety | yes | confirmed | owner policies | `owner_user_id` | via medication/profile | no by default | no | low | safe pending runtime | Private logs. |
| 6 | `medication_side_effect_notes` | medicationSafety | yes | confirmed | owner policies | `owner_user_id` | via medication/profile | no by default | no | low | safe pending runtime | Sensitive notes. |
| 6 | `medication_refill_reminders` | medicationSafety | yes | confirmed | owner policies | `owner_user_id` | via medication/profile | no by default | no | low | safe pending runtime | Reminder privacy required. |
| 6 | `supplements` | medicationSafety | yes | confirmed | owner policies | `owner_user_id` | `subject_care_profile_id` | no by default | no | low | safe pending runtime | Private by default. |
| 6 | `supplement_schedules` | medicationSafety | yes | confirmed | owner policies | `owner_user_id` | via supplement/profile | no by default | no | low | safe pending runtime | Review-first required. |
| 6 | `supplement_logs` | medicationSafety | yes | confirmed | owner policies | `owner_user_id` | via supplement/profile | no by default | no | low | safe pending runtime | Private logs. |
| 6 | `medication_review_flags` | medicationSafety | yes | confirmed | owner policies | `owner_user_id` | optional | no by default | no | low | safe pending runtime | Review flags private. |
| 7 | `pregnancy_profiles` | lifeStageHealth | yes | confirmed | owner policies | `owner_user_id` | profile id | no by default | no | low | safe pending runtime | Pregnancy private by default. |
| 7 | `pregnancy_logs` | lifeStageHealth | yes | confirmed | owner policies | `owner_user_id` | `pregnancy_profile_id` | no by default | no | low | safe pending runtime | Private logs. |
| 7 | `pregnancy_appointments` | lifeStageHealth | yes | confirmed | owner policies | `owner_user_id` | `pregnancy_profile_id` | no by default | no | low | safe pending runtime | Private appointments. |
| 7 | `pregnancy_checklists` | lifeStageHealth | yes | confirmed | owner policies | `owner_user_id` | `pregnancy_profile_id` | no by default | no | low | safe pending runtime | Private checklist. |
| 7 | `pregnancy_care_team` | lifeStageHealth | yes | confirmed | owner policies | `owner_user_id` | `pregnancy_profile_id` | no by default | no | low | safe pending runtime | Care team private. |
| 7 | `women_health_logs` | lifeStageHealth | yes | confirmed | owner policies | `owner_user_id` | `subject_care_profile_id` | no by default | no | low | safe pending runtime | Private by default. |
| 7 | `contraception_logs` | lifeStageHealth | yes | confirmed | owner policies | `owner_user_id` | `subject_care_profile_id` | no by default | no | low | safe pending runtime | Private by default. |
| 7 | `sex_day_logs` | lifeStageHealth | yes | confirmed | strict owner policies | `owner_user_id` | `subject_care_profile_id` | no | no | low | safe pending runtime | Must never appear in shared contexts. |
| 7 | child log tables | lifeStageHealth | yes | confirmed | owner/subject profile policies | `owner_user_id` | `subject_care_profile_id` | guardian/explicit caregiver expected | no | medium | deferred | Actor tests required for child/caregiver access. |
| 8 | `ai_extraction_jobs` | aiImport | yes | confirmed | owner policies | `owner_user_id` | optional | no | no | low | safe pending runtime | Candidate only. |
| 8 | `ai_import_envelopes` | aiImport | yes | confirmed | owner policies | `owner_user_id` | optional target | no | no | low | safe pending runtime | Review-first required. |
| 8 | `ai_review_events` | aiImport | yes | confirmed | owner/envelope policies | via envelope/owner | optional target | no | no | low | safe pending runtime | Audit event table. |
| 8 | `ai_source_evidence` | aiImport | yes | confirmed | owner/envelope policies | via envelope/owner | optional target | no | no | low | safe pending runtime | Storage paths do not grant access. |
| 8 | `ai_conversations` | aiImport | yes | not confirmed | none found in Batch 8 | unknown | unknown | unknown | no | medium | fix needed | Planned table not present in local Batch 8 migration. |
| 8 | `ai_messages` | aiImport | yes | not confirmed | none found in Batch 8 | unknown | unknown | unknown | no | medium | fix needed | Planned table not present in local Batch 8 migration. |
| 9 | fitness/nutrition owner tables | fitnessNutrition | yes | confirmed | owner manage policies | `owner_user_id` | optional | no by default | no | low | safe pending runtime | All Batch 9 planned tables have RLS enabled locally. |
| 10 | trusted content public catalog | trustedContent | no/low | confirmed | authenticated published/active read | n/a | n/a | n/a | authenticated published read | low | safe pending admin model | Catalog is not private health data. |
| 10 | saved/read/feedback tables | trustedContent | yes | confirmed | owner select/insert/manage | `owner_user_id` | none | no | no | low | safe pending runtime | Saved/read history private. |

## Tables Missing Confirmed RLS In Planned Batch Files

- `profile_photo_metadata`
- `caregiver_profiles`
- `ai_conversations`
- `ai_messages`

## Runtime Verification

Not run. Step 38 did not run SQL tests or remote Supabase commands.
