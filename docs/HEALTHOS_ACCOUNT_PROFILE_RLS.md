# HealthOS Account Profile RLS

Date: 2026-06-17

## Existing RLS Found

`profiles`, `profile_settings`, `profile_modules`, and `profile_widgets` already have owner-only RLS policies in `20260602205116_step_17_profile_preferences_sync.sql`.

`user_feature_preferences` has owner-only RLS policies in `20260612184825_user_feature_preferences.sql`.

`emergency_contacts` has owner-only RLS policies in `20260611082755_profile_contact_information.sql`.

## Draft RLS Created

The Batch 1 migration draft creates owner-only RLS for:

- `onboarding_preferences`
- `app_preferences`
- `notification_preferences`

Policy pattern:

- `select`: `(select auth.uid()) = user_id`
- `insert`: `with check ((select auth.uid()) = user_id)`
- `update`: `using` and `with check` both enforce `(select auth.uid()) = user_id`

No delete policies were added for the new preference tables.

## Risks

- The draft migration is not applied.
- Generated database types do not include the draft tables yet.
- UI writes to draft tables must remain deferred until migration and types are applied.

