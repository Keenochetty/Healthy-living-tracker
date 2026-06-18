# HealthOS Records Service Implementation

Date: 2026-06-17

## Files

- `src/features/records/recordTypes.ts`
- `src/features/records/recordDefaults.ts`
- `src/features/records/recordMappers.ts`
- `src/features/records/recordValidation.ts`
- `src/features/records/recordPrivacy.ts`
- `src/features/records/recordStoragePaths.ts`
- `src/features/records/recordService.ts`
- `src/features/records/useRecords.ts`
- `src/features/records/useRecordDetail.ts`
- `src/features/records/useRecordFiles.ts`
- `src/features/records/useRecordLinks.ts`
- `src/features/records/useRecordExtractions.ts`
- `src/features/records/index.ts`

## Behavior

The service uses the existing Supabase anon client only. It does not use service-role keys.

When Batch 4 tables are unavailable, service methods return `missingTable` instead of fake data.

Signed URL creation is short-lived and only allowed for `health-records-private` records with owner-scoped paths.

## Deferred

- Uploading bytes.
- OCR.
- AI persistence to downstream realm tables.
- Active Records Realm UI replacement.
