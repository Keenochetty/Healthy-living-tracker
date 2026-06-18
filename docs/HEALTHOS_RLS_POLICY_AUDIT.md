# HealthOS RLS Policy Audit

Date: 2026-06-17

## Scope

Inspected Supabase migrations under `supabase/migrations`, Edge Functions under `supabase/functions`, Expo Supabase client setup in `src/lib/supabase.ts`, storage helpers in `src/services/storage/privateFileService.ts`, and feature storage files under `src/lib`.

## Summary

- RLS enabled in migrations for the main user-data tables: profiles, users, families, family members, family memberships, children, caregiver access, sharing permissions, health records, records/documents, AI history/actions, device tokens, settings, notifications, reminders, calendar events, and imported fitness/AI plans.
- Several policies use explicit owner columns (`id`, `user_id`, `profile_id`, `owner_id`, `created_by_user_id`, `requested_by_user_id`, `recipient_user_id`).
- Family/caregiver tables use helper functions such as `private.user_has_family_access`, `private.user_can_admin_family`, and `private.user_has_child_caregiver_access`.
- Public-reference policies using `using (true)` were found only for reference-style muscle map tables, which is acceptable when the tables remain non-personal reference data.
- Draft migration added for reference/config tables created without RLS in `20260611175224_add_fitness_helper_tables.sql`.

## Table Policy Matrix

| Table | Realm | Privacy class | Owner / scope column | RLS status | Policy status | Risk | Recommended fix |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `profiles` | Auth/Profile | userPrivate | `id` | enabled | own select/update/insert | Low | Keep owner-only policies. |
| `users` | Auth/Profile | userPrivate | `id` | enabled | own select/update | Low | Keep owner-only policies. |
| `user_settings` | Settings | userPrivate | `user_id` / `profile_id` | enabled | own manage | Low | Keep compatibility shape documented. |
| `profile_settings` | Profile settings | userPrivate | profile-scoped | enabled | unknown in inspected excerpt | Medium | Verify policies after generated type refresh. |
| `profile_modules` | Profile settings | userPrivate | profile-scoped | enabled | unknown in inspected excerpt | Medium | Verify policies after generated type refresh. |
| `profile_widgets` | Profile settings | userPrivate | profile-scoped | enabled | unknown in inspected excerpt | Medium | Verify policies after generated type refresh. |
| `families` | Family | familyShared | `owner_id`, family membership | enabled | owner/admin/member policies | Medium | Membership read is acceptable for family shell; medical data must require separate permissions. |
| `family_members` | Family | familyShared | `family_id`, `profile_id`, `managed_by_user_id` | enabled | member/admin policies | Medium | Ensure inactive/removed members are excluded everywhere. |
| `family_memberships` | Family | familyShared | `family_id`, `user_id`, status/role | enabled | own/admin policies | Medium | Keep removed/inactive status filtering mandatory. |
| `family_invites` | Family | familyShared | `family_id`, invite recipient | enabled | admin/own invite policies | Medium | Pending invites must not grant data access. |
| `sharing_permissions` | Sharing | familyShared | `owner_profile_id`, `target_profile_id`, `created_by_user_id`, `grantee_user_id` | enabled | owner/target/admin policies | High | Schema supports permissions but policies still include broad family visibility in older migrations; tighten module-specific grants before release. |
| `children` | Baby/Child | childParentManaged | `family_id`, `family_member_id`, `created_by` | enabled | family/admin/caregiver read policies | High | Add teen/adult transition ownership model before production use. |
| `caregiver_profiles` | Caregiver | caregiverLimited | `profile_id` / `user_id` | enabled | own manage | Low | Keep owner-only policies. |
| `caregiver_child_access` | Caregiver | caregiverLimited | `caregiver_user_id`, `caregiver_profile_id`, `child_id`, `family_id`, status | enabled | admin manage, caregiver own read/update status | Medium | Verify status and time-window filtering in every helper. |
| `care_instructions` | Baby/Child | caregiverLimited | `family_id`, `child_id`, `created_by_user_id` | enabled | family manage, caregiver shared read | Medium | Keep caregiver access scoped by child assignment. |
| `activity_logs` | Baby/Child | caregiverLimited | `family_id`, `child_id`, `created_by_user_id` | enabled | family manage, caregiver insert/read shared | Medium | Ensure logs with private privacy levels remain hidden from caregivers. |
| `activity_photos` | Baby/Child records | caregiverLimited | `family_id`, `activity_log_id`, `uploaded_by_user_id` | enabled | family/caregiver visibility via activity logs | Medium | Storage path convention must remain family-scoped and private. |
| `notifications` | Notifications | userPrivate | `recipient_user_id` / `recipient_profile_id` | enabled | own read/update, controlled insert | Medium | Notification detail copy must stay privacy-safe. |
| `device_tokens` | Notifications | systemPrivate | `user_id` / `profile_id` | enabled | own manage | Low | Do not expose raw tokens in UI. |
| `audit_logs` | Privacy/security | systemPrivate | `actor_user_id`, `actor_profile_id`, `family_id` | enabled | family read / own insert | High | Audit logs may contain metadata; avoid sensitive raw payloads. |
| `health_records` | Health/records | familyShared | `family_id`, `family_member_id`, `created_by_user_id` | enabled | family/caregiver read, creator write | High | Family access is broad; require explicit permission before release. |
| `health_logs` | Health | familyShared | `family_id`, `created_by_user_id` | enabled by dynamic loop | dynamic family policies | High | Broad family access requires module permissions. |
| `medicine_logs` | Medication | familyShared | `family_id`, `created_by_user_id` | enabled by dynamic loop | dynamic family policies | High | Medication details should not be shared by membership alone. |
| `temperature_logs` | Health | familyShared | `family_id`, `created_by_user_id` | enabled by dynamic loop | dynamic family policies | High | Add explicit health-summary permission. |
| `doctor_visits` | Health | familyShared | `family_id`, `created_by_user_id` | enabled by dynamic loop | dynamic family policies | High | Visits and provider notes need explicit sharing. |
| `medical_records` | Records | familyShared | `family_id` | enabled | owner/family owner policies | Medium | Legacy table; confirm whether still active. |
| `medical_documents` | Records/storage | familyShared | `record_id`, family relation | enabled | owner/family owner policies | Medium | Legacy table; confirm active storage path mapping. |
| `documents` | Records/storage | familyShared | `family_id`, `created_by_user_id`, `uploaded_by_user_id` | enabled by dynamic loop | dynamic family policies | High | Storage access must be explicitly shared, not full family by default. |
| `reminders` | Reminders | userPrivate/familyShared | `family_id`, `created_by_user_id` | enabled by dynamic loop | dynamic family policies | High | Medication/women's health reminders need private default. |
| `calendar_events` | Calendar | familyShared | `family_id`, `created_by_user_id`, `created_by`, share flags | enabled | visible routed event policies | Medium | Personal events should use owner checks; caregiver events should use share flags. |
| `event_responses` | Calendar | familyShared | `responder_user_id`, `family_id` | enabled | own/family event response policies | Medium | Keep response visibility tied to event visibility. |
| `emergency_contacts` | Profile/emergency | emergencyOnly | `profile_id`, `family_id`, `family_member_id` | enabled | own/manage and caregiver shared read variants | Medium | Emergency access needs explicit flow and audit. |
| `medications` | Medication | familyShared | `family_id`, `family_member_id` | enabled | family manage, caregiver shared read | High | Medication sharing must become explicit permission-based. |
| `conditions` | Health | familyShared | `family_id`, `family_member_id` | enabled | family manage, caregiver shared read | High | Conditions should not be membership-wide by default. |
| `appointments` | Calendar/health | familyShared | `family_id`, `family_member_id`, `created_by_user_id` | enabled | family manage | Medium | Health appointment notes need explicit privacy. |
| `ai_chat_sessions` | AI | familyShared/userPrivate | `created_by_user_id`, `family_id` | enabled | accessible family / own variants | High | AI chats may contain PHI; prefer private unless explicitly shared. |
| `ai_messages` | AI | userPrivate | session ownership | enabled | own session policies | Medium | Keep message access tied to session owner. |
| `ai_actions` | AI | userPrivate/familyShared | `requested_by_user_id`, `family_id` | enabled | own/private/family policies | High | Raw inputs/outputs should not be family-visible by default. |
| `ai_chats` | AI legacy | familyShared | `family_id`, `created_by_user_id` | enabled by dynamic loop | dynamic family policies | High | Legacy table should be migrated or restricted. |
| `app_ai_chats` | AI app bridge | userPrivate | `user_id` | enabled | own manage | Low | Good owner-only shape. |
| `app_ai_messages` | AI app bridge | userPrivate | `user_id`, `chat_id` | enabled | own manage and chat owner check | Low | Good owner-only shape. |
| `app_ai_imports` | AI imports | userPrivate | `user_id` | enabled | own manage | Low | Good review-first storage. |
| `app_ai_actions` | AI actions | userPrivate | `user_id` | enabled | own manage | Low | Good owner-only shape. |
| `app_ai_scan_results` | Scan/AI | userPrivate | `user_id` | enabled | own manage | Low | Good owner-only shape. |
| `healthsync_ai_sessions` | AI history | userPrivate | `user_id` | enabled | own select/insert/update/delete | Low | Good owner-only shape. |
| `healthsync_ai_imports` | AI imports | userPrivate | `user_id`, `session_id` | enabled | own policies with session owner check | Low | Good review-first shape. |
| `user_imported_plans` | Fitness/Nutrition AI import | userPrivate | `user_id`, `profile_id` | enabled | own manage | Low | Good owner-only shape. |
| `user_imported_plan_days` | Fitness/Nutrition AI import | userPrivate | parent plan owner | enabled | own via plan owner | Low | Good relational owner check. |
| `user_plan_calendar_events` | Fitness/calendar | userPrivate | `user_id` | enabled | own manage | Low | Good owner-only shape. |
| `user_fitness_history` | Fitness | userPrivate | `user_id`, `profile_id` | enabled | own read/insert | Low | Add update/delete only if product needs it. |
| `ai_plan_search_logs` | AI/Fitness search | userPrivate | `user_id`, `profile_id` | enabled | own read/insert | Low | Consider retention policy. |
| `fitness_muscle_groups` | Fitness reference | publicReference | none | enabled | anon/auth read | Low | `using (true)` acceptable reference data. |
| `fitness_exercise_muscle_targets` | Fitness reference | publicReference | none | enabled | anon/auth read | Low | `using (true)` acceptable reference data. |
| `user_muscle_load_history` | Fitness | userPrivate | `user_id` | enabled | own read/insert | Low | Add update/delete only if needed. |
| `user_feature_preferences` | Preferences | userPrivate | `user_id` | enabled | own select/insert/update/delete | Low | Good owner-only shape. |
| `subscriptions` | Billing | userPrivate/familyShared | `user_id`, `family_id` | enabled | own/family access | Medium | Confirm billing visibility expectations. |
| `fitness_calendar_activation_rules` | Fitness config | publicReference | none | missing before Phase 23 | draft migration added | Low | Apply draft locally/remote after review. |
| `fitness_history_event_taxonomy` | Fitness config | publicReference | none | missing before Phase 23 | draft migration added | Low | Apply draft locally/remote after review. |
| `fitness_source_references` | Fitness content source | publicReference | none | missing before Phase 23 | draft migration added | Low | Apply draft locally/remote after review. |
| `fitness_muscle_map_layers` | Fitness config | publicReference | none | missing before Phase 23 | draft migration added | Low | Apply draft locally/remote after review. |
| `ai_import_workflow_config` | AI import config | publicReference/systemPrivate | none | missing before Phase 23 | draft migration added | Medium | Read-only to authenticated; writes remain server/admin-managed. |

## Broad Policy Findings

- `using (true)` appears for `fitness_muscle_groups` and `fitness_exercise_muscle_targets`, both classified as public reference data.
- Older family-health policies allow broad family access to health tables through `private.user_has_family_access(family_id)`. This is acceptable for early family shell data, but not enough for production medical privacy.
- Caregiver policies generally check assignment helpers and status, but caregiver access depends on consistent use of `privacy_level = 'caregiver_shared'` and active grants.

## Migration Status

Created draft migration:

- `supabase/migrations/20260617145939_phase_23_reference_rls_hardening.sql`

No migration was applied. No remote Supabase command was run.
