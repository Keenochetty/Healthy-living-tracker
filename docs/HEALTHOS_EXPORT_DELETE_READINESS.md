# HealthOS Export / Delete Readiness

Date: 2026-06-17

## Export Readiness

Existing backend:

- `supabase/functions/data-export/index.ts` exists and uses an authenticated user client.

Data that should be included in export:

- Account/profile: `users`, `profiles`, `user_settings`, `profile_settings`, `profile_modules`, `profile_widgets`
- Family/caregiver: `families`, `family_members`, `family_memberships`, `family_invites`, `sharing_permissions`, `caregiver_profiles`, `caregiver_child_access`
- Child/baby: `children`, `care_instructions`, `activity_logs`, `activity_photos`
- Health/records: `health_records`, `health_logs`, `temperature_logs`, `doctor_visits`, `documents`, `medical_records`, `medical_documents`
- Medication/supplements: `medications`, `medicine_logs`, supplement app storage if persisted
- AI: `ai_chat_sessions`, `ai_messages`, `ai_actions`, `app_ai_*`, `healthsync_ai_*`, `ai_plan_search_logs`
- Calendar/reminders/notifications: `calendar_events`, `event_responses`, `reminders`, `notifications`, `device_tokens` metadata only
- Fitness/nutrition: `user_imported_plans`, `user_imported_plan_days`, `user_plan_calendar_events`, `user_fitness_history`, nutrition persisted data when added
- Trusted content: saved/read-later user state if persisted

Missing or needs review:

- Storage file export manifest for private record buckets.
- AI raw response retention policy.
- Family/caregiver export scoping when one account owns data about another person.
- Adult child transition export ownership.

## Delete Readiness

Existing backend:

- `supabase/functions/delete-account/index.ts` exists.
- It uses `SUPABASE_SERVICE_ROLE_KEY` server-side only and removes storage objects by prefix.

Deletion must cover:

- Auth account row and app user/profile rows.
- Private records metadata and storage files.
- AI conversations/imports/actions/search logs.
- Device push tokens.
- Family membership cleanup.
- Caregiver assignments and invites.
- Notification history and reminder rows.
- Audit/history retention rules.

Missing or needs review:

- Legal retention policy for audit logs and health-record deletion.
- Storage bucket list must match all private buckets used by the client.
- Child/adult ownership transfer before deleting a parent account.
- Shared family data ownership after one member deletes their account.

## Release Blockers

- Verify account deletion end to end in a development build.
- Verify storage cleanup against every private bucket used by production code.
- Define retention policy for audit logs, AI logs, and deleted health records.
