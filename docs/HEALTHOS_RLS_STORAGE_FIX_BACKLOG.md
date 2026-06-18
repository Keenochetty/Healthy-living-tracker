# HealthOS RLS Storage Fix Backlog

Date: 2026-06-18

| ID | Area | Severity | File/Table/Bucket | Problem | Recommended Fix | Safe Now | Deferred Reason | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| RLS-001 | Account | medium | `profile_photo_metadata` | Planned table RLS not confirmed in local Batch 1 migration. | Confirm table exists or remove from planned MVP registry; add owner-only RLS if implemented. | no | Requires schema decision/migration. | open |
| RLS-002 | Care Profiles | medium | `caregiver_profiles` | Planned table RLS not confirmed in local Batch 2 migration. | Confirm whether `caregiver_assignments` replaces it or add explicit RLS in a future migration. | no | Requires schema decision. | open |
| RLS-003 | AI Import | medium | `ai_conversations`, `ai_messages` | Planned tables not confirmed in Batch 8 migration. | Align AI chat persistence model with existing `healthsync_ai_sessions`/imports or add planned tables later. | no | Requires schema/type generation pass. | open |
| RLS-004 | Reference Data | low | `20260617145939_phase_23_reference_rls_hardening.sql` | `using (true)` found on reference/read-only tables. | Keep only if tables are non-sensitive public/reference data; document table purpose. | yes | Docs only unless table content changes. | documented |
| RLS-005 | Fitness Reference Data | low | `fitness_muscle_groups`, `fitness_exercise_muscle_targets` | `to anon, authenticated using (true)` found for non-user catalog muscle data. | Keep only for non-user reference data; never store user exercise logs there. | yes | Public reference data acceptable. | documented |
| RLS-006 | Legacy API Grants | medium | `20260531041146_repair_activity_logs_api_access.sql` | Grants to `anon, authenticated` found in legacy activity logs repair migration. | Re-audit legacy activity tables before production; ensure RLS constrains rows. | no | Needs SQL actor tests. | open |
| STOR-001 | Private Buckets | high | `food-images`, `baby-records-private`, `medication-labels-private`, `supplement-labels-private`, `pregnancy-records-private`, `ai-temp-uploads` | Client helper references buckets whose creation/policies were not confirmed in local SQL audit. | Add/verify private bucket creation and owner-folder storage policies in a future migration. | no | Bucket creation/policy changes are out of Step 38 scope. | open |
| STOR-002 | Legacy Buckets | medium | `documents`, `caregiver-uploads`, `profile-photos` | Buckets are private but detailed policies were not confirmed. | Confirm object policies or deprecate in favor of canonical private buckets. | no | Needs storage policy migration/audit. | open |
| ERR-001 | Privacy-Safe Errors | low | `recordService`, `privateFileService` | Raw backend/storage errors could surface to callers. | Replaced with generic privacy-safe messages in Step 38. | yes | Completed locally. | done |
