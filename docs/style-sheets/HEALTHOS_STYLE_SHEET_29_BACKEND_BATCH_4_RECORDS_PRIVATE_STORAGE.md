# HealthOS Style Sheet 29 - Backend Batch 4: Records + Private Storage Metadata

## Purpose

Defines the backend foundation for private HealthOS records, private file metadata, record-to-realm links, review-first extraction metadata, and emergency packet selection.

## Scope

- Additive SQL migration draft only.
- No remote Supabase commands.
- No file upload implementation.
- No OCR or AI direct-write implementation.
- No medication, pregnancy, baby/child, or women's health writes.
- No public buckets or permanent signed URLs.
- No raw storage paths in UI.

## Target Tables

- `records`
- `record_files`
- `record_links`
- `record_extractions`
- `emergency_packet_items`

## Target Bucket

- `health-records-private`

Path convention:

```text
{owner_user_id}/records/{subject_care_profile_id_or_self}/{record_id}/{file_id}-{safe_file_name}
```

## Verification

Run typecheck only. Do not run full build/export for this batch.
