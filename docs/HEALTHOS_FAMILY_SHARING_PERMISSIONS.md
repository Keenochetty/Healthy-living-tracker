# HealthOS Family Sharing Permissions

Date: 2026-06-17

## Permission Metadata

The app now defines static UI permission keys in `src/features/privacy/sharingPermissions.ts`:

- `view_profile_summary`
- `view_calendar_shared`
- `view_health_summary`
- `view_medication_summary`
- `view_records_shared`
- `view_child_profile`
- `view_child_logs`
- `view_pregnancy_updates`
- `view_womens_health_summary`
- `view_family_updates`
- `manage_circle`
- `invite_members`
- `manage_permissions`
- `caregiver_limited_view`
- `caregiver_add_note`
- `emergency_packet_view`

## Database Status

Tables found:

- `families`
- `family_members`
- `family_memberships`
- `family_invites`
- `sharing_permissions`
- `caregiver_child_access`

The database has a sharing permission table, but older RLS policies still allow broad family access to several medical tables through `private.user_has_family_access(family_id)`.

## Required Production Rule

Family membership must not equal full medical access.

Before release, sensitive realm access should check both:

1. Active family/caregiver relationship.
2. Explicit module permission matching the data area.

## Release Blockers

- Tighten health, medication, records, pregnancy, women's health, and AI policies to require explicit permission.
- Ensure removed/inactive members cannot read records through any helper.
- Add adult child ownership transition rules.
