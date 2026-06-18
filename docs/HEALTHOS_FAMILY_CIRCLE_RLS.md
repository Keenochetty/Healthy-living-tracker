# HealthOS Family Circle RLS

## Created Helpers

- `public.is_active_circle_member(circle_id, user_id)`
- `public.is_circle_admin(circle_id, user_id)`
- `public.has_family_permission(circle_id, subject_profile_id, user_id, permission_key)`
- `public.is_subject_owner_or_manager(subject_profile_id, user_id)`
- `public.is_active_caregiver_for_subject(subject_profile_id, user_id)`

Helpers use `security definer` with explicit revokes and grants to `authenticated` to avoid recursive RLS checks.

## Policies Created

Family circles:

- creator or active member can read
- creator can insert
- owner/admin can update

Members:

- own row, active circle members, and admins can read
- admins/creator can insert
- admins can update

Invites:

- admins, inviters, and addressed invitees can read
- admins can create/update

Sharing permissions:

- grantor, granted user/member, or admin can read
- grantor plus admin/subject manager/manage-permissions can create/update

Caregiver assignments:

- caregiver, assigner, or subject manager can read
- subject manager can create/update

## Medical Sharing Rule

Family membership is not medical permission. Sensitive realms must check explicit sharing permissions before exposing records, medication, child logs, pregnancy data, or women’s health data.
