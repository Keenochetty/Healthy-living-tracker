# HealthOS Care Profile Schema

## Tables

`care_profiles` stores identity metadata only. It is the canonical future row for a person or care subject selected in the app.

`care_profile_relationships` links authenticated users to care profiles with a simple relationship label and identity-management flag.

`active_care_profile_preferences` stores the signed-in user's current profile context.

## Existing Tables Not Replaced

`children` remains the existing baby/child data table. `caregiver_profiles` remains the caregiver-worker profile table. `family_members` and `family_memberships` remain the existing family/circle access tables.

## Intentional Limits

This schema does not store health logs, child activity logs, pregnancy records, medication records, nutrition records, or document permissions.
