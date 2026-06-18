# HealthOS SQL Policy Test Examples

Date: 2026-06-18

These examples are documentation only. Do not run them against production. Replace placeholder UUIDs only in a local/staging environment with synthetic test users.

## Placeholders

- Owner: `00000000-0000-0000-0000-000000000001`
- Other user: `00000000-0000-0000-0000-000000000002`
- Family member: `00000000-0000-0000-0000-000000000003`
- Caregiver: `00000000-0000-0000-0000-000000000004`

## Example Cases

```sql
-- Owner can read own records.
-- As owner session:
select id, title from public.records where owner_user_id = '00000000-0000-0000-0000-000000000001';

-- Different authenticated user should not read owner's records.
-- As other user session:
select id, title from public.records where owner_user_id = '00000000-0000-0000-0000-000000000001';

-- Family member without explicit permission should not read records.
select id from public.records where subject_care_profile_id = '<subject-care-profile-id>';

-- Family member with explicit view_records_shared can read only permitted record summaries.
select id, title from public.records where subject_care_profile_id = '<permitted-subject-care-profile-id>';

-- Caregiver without assignment should not read child logs.
select id from public.child_care_logs where subject_care_profile_id = '<child-profile-id>';

-- Caregiver with limited assignment should read only allowed caregiver scope.
select id from public.caregiver_notes where subject_care_profile_id = '<assigned-child-profile-id>';

-- Storage owner can list own private record objects.
select name from storage.objects where bucket_id = 'health-records-private' and name like '00000000-0000-0000-0000-000000000001/%';

-- Unrelated user should not list another user's private objects.
select name from storage.objects where bucket_id = 'health-records-private' and name like '00000000-0000-0000-0000-000000000001/%';
```
