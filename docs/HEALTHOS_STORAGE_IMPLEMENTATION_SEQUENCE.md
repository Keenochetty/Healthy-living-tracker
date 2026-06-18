# HealthOS Storage Implementation Sequence

Date: 2026-06-17

## Order

1. Profile avatars.
2. Records/documents.
3. Scan source images.
4. AI evidence thumbnails.
5. Trusted content images only if licensed/source-backed.

## Rules

- Records buckets should be private.
- Scan images should not be public.
- Signed URLs should be short-lived.
- Raw storage paths must not appear in UI.
- Storage object policies must align with metadata ownership.
- Upsert behavior needs INSERT, SELECT, and UPDATE policies if replacement is supported.

