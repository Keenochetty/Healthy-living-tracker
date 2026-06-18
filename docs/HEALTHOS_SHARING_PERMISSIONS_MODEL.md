# HealthOS Sharing Permissions Model

## Permission Keys

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

## Scopes

- `summary`
- `limited`
- `details`
- `emergency`
- `manage`

## Conservative Defaults

Permissions default to `summary` and `active` only when explicitly granted. Expired, revoked, inactive, unknown, pending, or removed states grant no access.

## Privacy Notes

Women’s health, records, child logs, pregnancy updates, and medication summaries require explicit permission. This batch does not implement full medical sharing or downstream realm enforcement.
