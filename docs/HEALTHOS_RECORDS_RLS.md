# HealthOS Records RLS

Date: 2026-06-17

## Policy Model

Batch 4 uses owner-first RLS.

- Owners can create, update, delete, and read their own records.
- Explicit recipients can read records only through active `sharing_permissions` rows with `view_records_shared` or `emergency_packet_view`.
- Record files inherit read access from the parent record.
- Record links, extraction metadata, and emergency packet items remain owner-managed only.

## Helper Functions

- `public.owns_healthos_record(record_id, user_id)`
- `public.can_access_healthos_record(record_id, user_id)`
- `public.can_access_healthos_record_file(record_file_id, user_id)`

These are `security invoker` helpers and do not use service-role privileges.

## Notes

Existing legacy medical policies still exist and may be broader than the final HealthOS model. Batch 4 does not rewrite them.
