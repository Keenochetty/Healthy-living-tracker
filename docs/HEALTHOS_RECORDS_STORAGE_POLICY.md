# HealthOS Records Storage Policy

Date: 2026-06-17

## Existing Buckets Found

- `medical-documents`
- `documents`
- `profile-photos`
- `profile-avatars`
- `activity-photos`
- `caregiver-uploads`
- `fitness-assets`

Code also references private health buckets that were not consistently created by existing migrations:

- `health-records-private`
- `baby-records-private`
- `medication-labels-private`
- `supplement-labels-private`
- `pregnancy-records-private`
- `ai-temp-uploads`

## Batch 4 Bucket Draft

The draft migration creates `health-records-private` as a private bucket.

Object path convention:

```text
{owner_user_id}/records/{subject_care_profile_id_or_self}/{record_id}/{file_id}-{safe_file_name}
```

## Policy Draft

- Owners can insert/update/delete objects only under their own first path segment.
- Owners can read their own objects.
- Explicit record viewers can read objects only when a matching `record_files` row points to the object and the parent record is shared through active permission metadata.

## Deferred

- Upload execution.
- Object cleanup jobs.
- Thumbnail buckets.
- AI temp upload retention policy.
- Reconciliation of legacy `medical-documents` path conflicts.
