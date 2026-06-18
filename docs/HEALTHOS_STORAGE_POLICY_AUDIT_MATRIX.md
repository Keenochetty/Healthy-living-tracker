# HealthOS Storage Policy Audit Matrix

Date: 2026-06-18

## Scope

This audit inspected local SQL and client/server storage references only. No buckets were created and no storage policies were applied or tested.

| Bucket | Area | Public | Health Data | Path Pattern | Owner Folder | Policy Found | Public URL Usage | Signed URL Usage | Raw Path UI Exposure | Risk | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `health-records-private` | Records | false | yes | `owner/profile/realm/record/file` in helper; SQL ties objects to `record_files` | yes | yes | no | yes | no in HealthOS detail UI | low | Best current private health file model. |
| `medical-documents` | Legacy records/documents | false | yes | owner folder in policy | yes | yes | no | possible legacy | unknown | medium | Legacy bucket; keep until canonical storage migration completes. |
| `profile-avatars` | Profile | false | profile image | `userId/avatar.ext` | yes | yes | no | yes, short-lived | no | low | Private avatar bucket with owner folder policy. |
| `profile-photos` | Legacy profile | false | profile image | unknown | unknown | bucket only | unknown | unknown | unknown | medium | Bucket creation found, detailed object policy not confirmed. |
| `activity-photos` | Family/activity logs | false | possible family/child activity | owner/profile path in SQL | partial | yes | no | unknown | unknown | medium | Private, but shared activity visibility needs actor tests. |
| `documents` | Legacy documents | false | possible health docs | unknown | unknown | bucket only | unknown | unknown | unknown | medium | Bucket creation found; policy not confirmed in current audit. |
| `caregiver-uploads` | Caregiver | false | possible health/care docs | unknown | unknown | bucket only | unknown | unknown | unknown | medium | Bucket creation found; explicit object policy not confirmed. |
| `fitness-assets` | Fitness catalog assets | true | no | catalog image assets | n/a | bucket public | yes by design | no | n/a | low | Public PNG assets only; should not store user health data. |
| `food-images` | Nutrition | unknown/local helper | possibly health/meal images | helper expects owner/profile path | yes in helper | not confirmed | no | possible | no | high | Helper references bucket; creation/policy not confirmed. |
| `baby-records-private` | Baby/Child | unknown/local helper | yes | helper expects owner/profile path | yes in helper | not confirmed | no | possible | no | high | Helper references bucket; creation/policy not confirmed. |
| `medication-labels-private` | Medication | unknown/local helper | yes | helper expects owner/profile path | yes in helper | not confirmed | no | possible | no | high | Helper references bucket; creation/policy not confirmed. |
| `supplement-labels-private` | Supplements | unknown/local helper | yes | helper expects owner/profile path | yes in helper | not confirmed | no | possible | no | high | Helper references bucket; creation/policy not confirmed. |
| `pregnancy-records-private` | Pregnancy | unknown/local helper | yes | helper expects owner/profile path | yes in helper | not confirmed | no | possible | no | high | Helper references bucket; creation/policy not confirmed. |
| `ai-temp-uploads` | AI/Scan | unknown/local helper | yes | helper expects owner/profile path | yes in helper | not confirmed | no | possible | evidence path only | high | AI source uploads need explicit storage policy before release. |

## Public Bucket Risks

No private health bucket was confirmed as public. `fitness-assets` is public by design and should remain restricted to non-user catalog images.

## Signed URL Rules

Signed URLs are short-lived in the inspected helpers. Step 38 changed storage service thrown errors to avoid exposing raw backend details.
