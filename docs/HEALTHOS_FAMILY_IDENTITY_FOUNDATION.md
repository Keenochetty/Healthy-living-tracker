# HealthOS Family Identity Foundation

## Current State

The app already has local and backend family identity concepts:

- Local `HealthProfile` and active profile helpers in `familyPermissionsStorage`.
- Local child profiles in `childStorage`.
- Local caregiver profiles in `caregiverStorage`.
- Backend `family_members`, `family_memberships`, `children`, `caregiver_profiles`, and `caregiver_child_access`.

## Batch 2 Direction

`care_profiles` becomes the future shared identity selector across realms. Existing tables are preserved and will be connected gradually.

## Realm Mapping

- Self: `care_profiles.profile_type = self`
- Child/Baby: `care_profiles.profile_type = child`, future link to `children`
- Dependent/Elder: `care_profiles.profile_type = dependent` or `elder`
- Pregnancy: `care_profiles.profile_type = pregnancy_subject`
- Caregiver contact: `care_profiles.profile_type = caregiver_contact`, distinct from worker `caregiver_profiles`
