# HealthOS Family Invites Foundation

## Existing State

`family_invites` already existed with `family_id`, `invited_email`, `role`, `status`, `token`, `invited_by_user_id`, and timestamp fields.

## Batch 3 Extension

The migration adds canonical columns:

- `circle_id`
- `invited_phone`
- `invited_user_id`
- `invited_care_profile_id`
- `invited_by`
- `token_hash`
- `accepted_at`

## Safety Rules

The service does not select or expose raw `token` or `token_hash`. It creates invite records only. Email sending is deferred.
