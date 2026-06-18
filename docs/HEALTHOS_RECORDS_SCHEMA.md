# HealthOS Records Schema

Date: 2026-06-17

## Existing Tables Found

- `medical_records`
- `medical_documents`
- `documents`

These remain untouched. They are legacy/equivalent record storage shapes and are not dropped, renamed, or backfilled in Batch 4.

## Batch 4 Draft Tables

- `records`: canonical private record metadata.
- `record_files`: private storage metadata, bucket id, object path, upload status, and file display metadata.
- `record_links`: links a record to a realm such as medication, pregnancy, baby/child, calendar, AI import, or health.
- `record_extractions`: review-first extracted metadata from scan/upload/AI sources.
- `emergency_packet_items`: owner-selected records or profile metadata for emergency packet assembly.

## Type Status

Generated Supabase types are stale until the migration is applied and types are regenerated. The Expo app uses local domain types under `src/features/records`.

## Deferred

- Legacy table backfill.
- Replacing `documents` and `medical_documents`.
- Production upload flow.
- Record sharing UI.
