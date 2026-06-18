# HealthOS Records Storage Privacy Audit

Date: 2026-06-18

## Result

Records RLS and `health-records-private` storage policy are the strongest privacy model currently present in the local SQL set. Runtime testing is still required.

## Confirmed In Local SQL

- `records`, `record_files`, `record_links`, `record_extractions`, and `emergency_packet_items` have RLS enabled.
- Record read access uses `can_access_healthos_record`.
- Shared record read access requires explicit permissions such as `view_records_shared` or `emergency_packet_view`.
- `health-records-private` bucket is created with `public = false`.
- Storage object read can use owner folder or matching `record_files` metadata plus record access function.

## Confirmed In UI/Services

- Record detail UI states that storage paths are hidden.
- Record file signed URLs are short-lived.
- Step 38 changed record/storage service errors to privacy-safe messages.

## Deferred Tests

- Unrelated user denied record metadata.
- Family member without permission denied record metadata and file object.
- Family member with permission can access only permitted record file.
- Signed URLs are not stored permanently.

## Risk

Low pending runtime RLS/storage actor tests.
