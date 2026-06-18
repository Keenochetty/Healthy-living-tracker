# HealthOS Storage Policy Audit

Date: 2026-06-17

## Buckets Found

| Bucket | Purpose | Public | Contains health data | Owner/path scope | Policy status | Signed URL status | Risk | Recommended fix |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `medical-documents` | Legacy medical documents | false | Yes | first folder is user id in early migration; later family-scoped policies exist | select/insert/update/delete policies found | Edge/client signed URLs exist | Medium | Confirm one canonical path model and remove conflicting legacy assumptions. |
| `documents` | General private documents | false | Yes | unclear from migrations | bucket private; object policies not fully visible for this bucket | unknown | High | Add explicit owner/record path policy before production records upload. |
| `health-records-private` | Private health records from app service type | unknown in migrations | Yes | `userId/profileId/realm/recordId/fileName` in client helper | no matching bucket migration found | short-lived signed URLs in `privateFileService` | High | Create bucket and storage policies or map service to existing `medical-documents` bucket. |
| `baby-records-private` | Baby/child records | unknown in migrations | Yes | `userId/profileId/realm/recordId/fileName` in client helper | no matching bucket migration found | short-lived signed URLs in `privateFileService` | High | Create bucket and path policies before enabling uploads. |
| `medication-labels-private` | Medication labels | unknown in migrations | Yes | `userId/profileId/realm/recordId/fileName` in client helper | no matching bucket migration found | short-lived signed URLs in `privateFileService` | High | Create bucket and path policies before enabling uploads. |
| `supplement-labels-private` | Supplement labels | unknown in migrations | Yes | `userId/profileId/realm/recordId/fileName` in client helper | no matching bucket migration found | short-lived signed URLs in `privateFileService` | High | Create bucket and path policies before enabling uploads. |
| `pregnancy-records-private` | Pregnancy records | unknown in migrations | Yes | `userId/profileId/realm/recordId/fileName` in client helper | no matching bucket migration found | short-lived signed URLs in `privateFileService` | High | Create bucket and path policies before enabling uploads. |
| `ai-temp-uploads` | AI temporary uploads | unknown in migrations | Yes | `userId/profileId/realm/recordId/fileName` in client helper | no matching bucket migration found | short-lived signed URLs in `privateFileService` | High | Add short-retention bucket policy and cleanup plan. |
| `activity-photos` | Child/caregiver activity photos | false | Yes | first path folder expected to be `family_id` | select/insert policies found | no generic signed URL review found | Medium | Add update/delete object policies if replacement/removal is supported. |
| `profile-photos` | Profile photos | false | Personal data | user scoped | bucket private; generic creation found | profile service uploads path by user id | Medium | Prefer one canonical bucket name with `profile-avatars`. |
| `profile-avatars` | Profile avatars | false | Personal data | first path folder is user id | select/insert/update/delete policies found | profile service returns path | Low | Keep bucket private; do not expose raw paths in UI. |
| `caregiver-uploads` | Caregiver files | false | Potentially sensitive | unknown | bucket private; no detailed object policy found | unknown | High | Define path and permission model before use. |
| `food-images` | Nutrition images | unknown in migrations | Potential health data | app service type only | no matching migration found | unknown | Medium | Add bucket policy if uploads are enabled. |
| `fitness-assets` | Public fitness reference assets | true | No | public reference images | bucket public by design | not sensitive | Low | Acceptable if only app-owned PNG reference assets are stored. |

## Code Findings

- `src/services/storage/privateFileService.ts` validates extension, MIME type, size, path shape, and uses 5-minute signed URLs.
- Phase 23 changed audit metadata from raw `path` to `pathScope` so private file audit logs do not store raw object paths.
- `validateFileAccessPermission` is intentionally documented as a client-side convenience gate only. Production must rely on `storage.objects` RLS and Edge Functions.
- `src/lib/profileContactStorage.ts` uploads profile avatars to `profile-avatars` using `userId/avatar.ext`.
- `supabase/functions/delete-account/index.ts` removes storage objects by prefix with the service role inside an Edge Function, not in the Expo client.

## Release Blockers

- Canonicalize private records buckets. The client helper references buckets that do not all have visible creation migrations.
- Add explicit `storage.objects` policies for every private health bucket before enabling user uploads.
- Keep signed URLs short-lived and generated only after server/database authorization where possible.
