# HealthOS Family Circle Schema

## Canonical Decision

Use `family_circles` and `family_circle_members` as the forward family/circle model. Keep existing `families`, `family_members`, and `family_memberships` as legacy/equivalent tables until a backfill plan is approved.

## Existing Equivalent Tables

`families` stores older family identity using `owner_id`.

`family_memberships` stores user-to-family account membership using `family_id`, `user_id`, and `role`.

`family_members` stores older care-subject/member records and is used by several legacy medical tables.

`family_invites` already exists, using `family_id`, `invited_email`, `role`, `status`, and a raw `token` column in old migrations.

## Batch 3 Tables

`family_circles`:

- `id`
- `created_by`
- `name`
- `description`
- `avatar_url`
- `privacy_scope`
- `status`
- timestamps

`family_circle_members`:

- `id`
- `circle_id`
- `user_id`
- `care_profile_id`
- `display_name`
- `email`
- `relationship_label`
- `role`
- `status`
- `joined_at`
- `invited_by`
- timestamps

## Roles

- `owner`
- `admin`
- `member`
- `caregiver`
- `viewer`

## Statuses

- `active`
- `pending`
- `invited`
- `declined`
- `removed`
- `inactive`

## Generated Types

Generated types are stale. Local domain types are used until migration apply and type regeneration.
