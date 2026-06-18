# HealthOS Account Profile Schema

Date: 2026-06-17

## Existing Tables Found

| Table | Source | Ownership | Status |
| --- | --- | --- | --- |
| `profiles` | Multiple migrations, latest alignment in `20260602205116_step_17_profile_preferences_sync.sql` and contact extensions in `20260611082755_profile_contact_information.sql` | `id = auth.uid()` | Existing |
| `profile_settings` | `20260602205116_step_17_profile_preferences_sync.sql` | `profile_id = auth.uid()` | Existing |
| `profile_modules` | `20260602205116_step_17_profile_preferences_sync.sql` | `profile_id = auth.uid()` | Existing |
| `profile_widgets` | `20260602205116_step_17_profile_preferences_sync.sql` | `profile_id = auth.uid()` | Existing |
| `user_settings` | `20260531060542_first_core_schema.sql` and earlier core migrations | `profile_id = auth.uid()` | Existing legacy/general JSON settings |
| `user_feature_preferences` | `20260612184825_user_feature_preferences.sql` | `user_id = auth.uid()` | Existing |
| `device_tokens` | Core migrations | `profile_id = auth.uid()` | Existing, push backend deferred |
| `emergency_contacts` | `20260611082755_profile_contact_information.sql` | `user_id = auth.uid()` | Existing |

## Missing Tables Drafted

- `onboarding_preferences`
- `app_preferences`
- `notification_preferences`

These are created only in the draft migration `supabase/migrations/20260617170000_healthos_batch_1_account_profile_preferences.sql`. The migration was not applied.

## Profile Columns

Known profile columns from migrations and code include:

- `id`
- `email`
- `full_name`
- `display_name`
- `avatar_url`
- `country`
- `language`
- `timezone`
- `date_of_birth`
- `phone`
- `preferred_contact_method`
- `created_at`
- `updated_at`

Draft-only additive columns:

- `avatar_storage_path`
- `profile_completed`
- `locale`

## Canonical Decision

For Batch 1, `profiles.id` remains the account profile owner key and equals `auth.uid()`. This avoids introducing a duplicate `user_id` column into an existing profile model.

