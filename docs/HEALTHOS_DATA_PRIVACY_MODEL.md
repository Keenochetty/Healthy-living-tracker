# HealthOS Data Privacy Model

Date: 2026-06-17

## Privacy Scopes

The app now has static helper metadata in `src/features/privacy`:

- `private`: owner-only by default.
- `selectedFamily`: shared only with selected people and explicit permission.
- `familyCircle`: non-sensitive family updates only; not full medical access.
- `caregiverLimited`: assigned caregiver access for limited tasks.
- `careTeam`: explicitly approved care-team participation.
- `emergencyOnly`: emergency packet or emergency access flows.
- `publicReference`: non-personal reference data.
- `unknown`: treated as private until confirmed.

## Sensitive Data Areas

Mapped in `src/features/privacy/sensitiveDataMap.ts`:

- Sensitive: profile, emergency contacts, health logs, biometrics, medication, supplements, records, pregnancy, baby/child, women's health, family, caregiver, AI import, notifications, calendar, fitness, nutrition.
- Public/reference: trusted content.

## Family Sharing Model

Family membership is not sufficient for full medical access.

Migrations include:

- `families`
- `family_members`
- `family_memberships`
- `family_invites`
- `sharing_permissions`
- helper functions including `private.user_has_family_access` and `private.user_can_admin_family`

Current risk: older policies still use family membership to read/manage broad health data. Before release, medical sharing should require module-specific permissions such as `view_health_summary`, `view_medication_summary`, `view_records_shared`, `view_pregnancy_updates`, and `view_womens_health_summary`.

## Child Ownership Model

Child data is parent/guardian-managed today through:

- `children`
- `family_members`
- `caregiver_child_access`
- `activity_logs`
- `care_instructions`

Release risk: the schema has `date_of_birth`, but no enforced 13+ participation model or 18+ adult ownership transition. Do not rely on parent-controlled access after adulthood without explicit adult sharing.

## Caregiver Limited Access Model

Caregiver data is scoped through:

- `caregiver_profiles`
- `caregiver_child_access`
- `private.user_has_child_caregiver_access`
- `privacy_level = 'caregiver_shared'`
- assignment status and time-window columns in later migrations

Caregivers are not profile switchers. They should see assigned children and assigned care tasks only.

## AI Data Boundary Model

AI data is sensitive. Tables found:

- `ai_chat_sessions`
- `ai_messages`
- `ai_actions`
- `ai_chats`
- `app_ai_chats`
- `app_ai_messages`
- `app_ai_imports`
- `app_ai_actions`
- `app_ai_scan_results`
- `healthsync_ai_sessions`
- `healthsync_ai_imports`
- `ai_plan_search_logs`

AI import helpers and UI are review-first. AI outputs must not directly save into medication, records, calendar, pregnancy, baby/child, nutrition, or fitness tables without user confirmation.

## Records And Storage Model

Records and files are private by default. Storage path patterns should include owner and record scope, preferably:

`userId/profileId/realm/recordId/fileName`

Current release blocker: not every private bucket referenced by code has a visible migration and matching storage policy. Raw object paths should not be shown in UI or stored in ordinary audit metadata.

## Notification Privacy Model

Notifications and reminder content are sensitive. Use privacy-safe titles by default:

- "Medication update"
- "Health log update"
- "Child care update"
- "Pregnancy update"
- "Reminder update"

Raw push tokens are private device data and must not be displayed in UI.

## Trusted Content Boundary

Trusted content/source metadata is reference data. Saved content, read-later state, and user notes are user-private unless explicitly shared. AI-generated summaries are not trusted sources.
