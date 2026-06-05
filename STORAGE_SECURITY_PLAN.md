# Storage Security Plan

Supabase Storage uses RLS on `storage.objects`; private buckets must not rely on UI-only checks.

## Buckets
- `health-records-private`: private.
- `profile-avatars`: private by default; public only if user explicitly chooses.
- `food-images`: private by default.
- `baby-records-private`: private.
- `medication-labels-private`: private.
- `supplement-labels-private`: private.
- `pregnancy-records-private`: private.
- `ai-temp-uploads`: private and short-lived.

## Path Convention
`userId/profileId/realm/recordId/fileName`

Examples:
- `user_123/profile_456/records/record_789/lab-result.pdf`
- `user_123/profile_456/baby/child_001/vaccine-card.jpg`

## RLS Rules
- Public cannot list private buckets.
- Users can upload only into their own `userId/profileId` path.
- Reads require owner/profile permission or `can_view_document(record_id)`.
- Caregivers can read only explicitly shared records/sections.
- Signed URLs are short-lived and generated only after permission checks.
- Avoid broad `select` policies on `storage.objects`.

## Validation
- Allowlist: jpg, jpeg, png, pdf, webp.
- Maximum file size: 10MB until product requirements say otherwise.
- Reject executable/script files.
- Sanitize filenames.
- Store original filename separately.
- Metadata includes uploader, profile, realm, and record ID.

## Backup Note
Supabase database backups do not include Storage objects. Storage requires a separate object backup/export plan.
