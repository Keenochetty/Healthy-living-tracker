# HealthOS Supabase RLS + Data Privacy Phase 23

Date: 2026-06-17

## Files Inspected

- `supabase/migrations/*`
- `supabase/functions/_shared/security.ts`
- `supabase/functions/ai-chat/index.ts`
- `supabase/functions/ai-extract/index.ts`
- `supabase/functions/ai-document-extraction/index.ts`
- `supabase/functions/data-export/index.ts`
- `supabase/functions/delete-account/index.ts`
- `src/lib/supabase.ts`
- `src/services/storage/privateFileService.ts`
- `src/lib/profileContactStorage.ts`
- `src/lib/*Storage.ts`
- `.env.example`
- `package.json`
- Feature areas under `src/features`, `src/components/healthos`, and active routes for AI, records, settings, reminders, family, caregiver, baby/child, pregnancy, cycle, medication, fitness, nutrition, calendar, and trusted content.

## Files Created

- `src/features/privacy/privacyScopes.ts`
- `src/features/privacy/sharingPermissions.ts`
- `src/features/privacy/sensitiveDataMap.ts`
- `src/features/privacy/permissionGuards.ts`
- `src/features/privacy/privacyCopy.ts`
- `src/features/privacy/index.ts`
- `supabase/migrations/20260617145939_phase_23_reference_rls_hardening.sql`
- `docs/style-sheets/HEALTHOS_STYLE_SHEET_23_SUPABASE_RLS_DATA_PRIVACY.md`
- `docs/HEALTHOS_SUPABASE_RLS_DATA_PRIVACY_PHASE_23.md`
- `docs/HEALTHOS_RLS_POLICY_AUDIT.md`
- `docs/HEALTHOS_STORAGE_POLICY_AUDIT.md`
- `docs/HEALTHOS_DATA_PRIVACY_MODEL.md`
- `docs/HEALTHOS_EXPORT_DELETE_READINESS.md`
- `docs/HEALTHOS_AI_DATA_BOUNDARIES.md`
- `docs/HEALTHOS_FAMILY_SHARING_PERMISSIONS.md`

## Files Updated

- `src/services/storage/privateFileService.ts`

Changed private-file audit metadata so raw storage object paths are not written into ordinary audit metadata. Audit metadata now stores `pathScope` with depth, owner-scoped boolean, and realm.

## Tables Audited

Audited tables found in migrations:

`profiles`, `users`, `user_settings`, `profile_settings`, `profile_modules`, `profile_widgets`, `families`, `family_members`, `family_memberships`, `family_invites`, `sharing_permissions`, `children`, `caregiver_profiles`, `caregiver_child_access`, `care_instructions`, `activity_logs`, `activity_photos`, `notifications`, `device_tokens`, `audit_logs`, `health_records`, `health_logs`, `medicine_logs`, `temperature_logs`, `doctor_visits`, `medical_records`, `medical_documents`, `documents`, `reminders`, `calendar_events`, `event_responses`, `emergency_contacts`, `medications`, `conditions`, `appointments`, `ai_chat_sessions`, `ai_messages`, `ai_actions`, `ai_chats`, `app_ai_chats`, `app_ai_messages`, `app_ai_imports`, `app_ai_actions`, `app_ai_scan_results`, `healthsync_ai_sessions`, `healthsync_ai_imports`, `user_imported_plans`, `user_imported_plan_days`, `user_plan_calendar_events`, `user_fitness_history`, `ai_plan_search_logs`, `fitness_muscle_groups`, `fitness_exercise_muscle_targets`, `user_muscle_load_history`, `user_feature_preferences`, `subscriptions`, `fitness_calendar_activation_rules`, `fitness_history_event_taxonomy`, `fitness_source_references`, `fitness_muscle_map_layers`, `ai_import_workflow_config`.

## RLS Enabled / Missing / Unknown Summary

- Enabled: most user-data tables have RLS enabled in migrations, often with forced RLS in core migrations.
- Missing before this phase: `fitness_calendar_activation_rules`, `fitness_history_event_taxonomy`, `fitness_source_references`, `fitness_muscle_map_layers`, and `ai_import_workflow_config` from `20260611175224_add_fitness_helper_tables.sql`.
- Draft hardening added: RLS and authenticated read-only reference policies for those five tables.
- Unknown: generated/current remote state was not queried because remote Supabase commands are blocked for this phase.

## Policies Audited

Policy types found:

- Owner-only policies using `auth.uid()` against `id`, `user_id`, `profile_id`, `created_by_user_id`, `requested_by_user_id`, and `recipient_user_id`.
- Family policies using `private.user_has_family_access`.
- Admin policies using `private.user_can_admin_family`.
- Caregiver policies using `private.user_has_child_caregiver_access`.
- Public reference policies using `using (true)` for non-personal fitness reference tables.

High-risk policy areas:

- Broad family access to health records, medication, conditions, documents, AI sessions/actions, and reminders in older migrations.
- Sharing permissions exist but are not yet consistently enforced per sensitive module.
- AI legacy tables may be family-readable and should be private unless explicitly shared.

## Storage Buckets Audited

Audited buckets:

- `medical-documents`
- `documents`
- `health-records-private`
- `baby-records-private`
- `medication-labels-private`
- `supplement-labels-private`
- `pregnancy-records-private`
- `ai-temp-uploads`
- `activity-photos`
- `profile-photos`
- `profile-avatars`
- `caregiver-uploads`
- `food-images`
- `fitness-assets`

See `docs/HEALTHOS_STORAGE_POLICY_AUDIT.md`.

## Owner Columns Found

Owner/scope columns found:

- `id`
- `user_id`
- `profile_id`
- `owner_id`
- `created_by`
- `created_by_user_id`
- `uploaded_by_user_id`
- `requested_by_user_id`
- `recipient_user_id`
- `recipient_profile_id`
- `actor_user_id`
- `actor_profile_id`
- `family_id`
- `family_member_id`
- `child_id`
- `record_id`
- `session_id`

## Family Sharing Permission Status

Family sharing tables and helpers exist, including `sharing_permissions`. The production permission model is incomplete because older policies still treat family access as enough for several medical realms. Static permission metadata was added in `src/features/privacy/sharingPermissions.ts`.

## Child Ownership / Age Transition Status

Child ownership is parent/guardian managed through `children`, `family_members`, and caregiver assignment tables. The schema has birth-date fields but no enforced 13+ teen participation or 18+ adult ownership transition. This remains a release risk.

## Caregiver Limited Access Status

Caregiver access is modeled with caregiver profiles, child access grants, status/time windows, and child caregiver helper functions. The model supports limited access, but production policies must consistently require active assignments and explicit permission for medications, records, and sensitive health details.

## Records / Storage Privacy Status

Records are sensitive. Database record tables generally have RLS, but private bucket coverage is incomplete for every bucket referenced by the client helper. Raw object path logging was sanitized in `privateFileService.ts`.

## AI Data Boundary Status

No OpenAI or service-role secret was found in the Expo client. AI provider calls are inside Supabase Edge Functions. AI imports remain review-first in app code and table shape, but legacy AI family-readable tables should be restricted or migrated.

## Notifications Privacy Status

Notification tables and device token tables are user-scoped by owner policies. Push tokens are not exposed in UI from the inspected files. Sensitive notification copy must continue using privacy-safe titles.

## Trusted Content Public / Private Status

Trusted content/source metadata is public/reference-style data. Saved or user-specific trusted content state should be user-private; no broad saved-content table was identified in migrations during this pass.

## Export / Delete Readiness Status

Existing Edge Functions:

- `data-export`
- `delete-account`

Release gaps:

- Storage file export manifest.
- Full private bucket cleanup coverage.
- Adult child transition ownership.
- Shared family/caregiver data cleanup rules.
- Audit/AI retention policy.

## Migration Drafts Created Or Deferred

Created:

- `supabase/migrations/20260617145939_phase_23_reference_rls_hardening.sql`

Deferred:

- Broad family medical-table policy tightening, because it requires product decisions for explicit module permissions.
- Private storage bucket policy creation for buckets whose path/bucket creation pattern is unclear.
- Adult child transition policies, because schema and product flows are not complete.

No migration was applied.

## Unsafe Logs / Secrets Found / Fixed / Deferred

Fixed:

- Removed raw storage path from private file audit metadata.

Found safe:

- Expo client uses only public Supabase URL and anon/publishable key.
- Service role is used only in Edge Functions such as delete account.
- OpenAI API key is read only in Supabase Edge Functions.

Deferred:

- Review Edge Function logs before production deployment to ensure no AI prompts, extraction payloads, JWTs, or storage paths are logged.

## Typecheck Result

Passed: `npm run typecheck`.

## Release Blockers

- Family membership currently grants too much access to some sensitive medical realms.
- Storage bucket migrations do not cover every private bucket referenced by client helper types.
- Adult child ownership transition is not implemented.
- AI retention and legacy AI table privacy need review.
- Export/delete must be verified end to end in a development build.
- Audit log metadata retention and sensitivity policy needs legal/product signoff.

## Next Recommended Phase

Create the explicit permission-backed RLS migration for sensitive medical realms after confirming the exact sharing product rules for health, medication, records, pregnancy, women's health, child data, AI history, and reminders.
