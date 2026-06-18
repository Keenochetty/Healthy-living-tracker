# HealthOS Backend Batch 4 - Records + Private Storage Metadata

Date: 2026-06-17

## Files Inspected

- `supabase/migrations`
- `supabase/functions/private-file-signed-url/index.ts`
- `src/services/storage/privateFileService.ts`
- `src/lib/healthRecordsStorage.ts`
- `src/app/records/index.tsx`
- `src/app/(tabs)/scan.tsx`
- `src/components/healthos/records`
- `src/components/healthos/scan`
- `src/types/healthRecords.ts`
- `src/types/database.ts`
- Batch 2 and Batch 3 backend docs
- Existing storage and RLS audit docs

## Files Created

- `supabase/migrations/20260617183000_healthos_batch_4_records_private_storage.sql`
- `src/features/records/*`
- `docs/style-sheets/HEALTHOS_STYLE_SHEET_29_BACKEND_BATCH_4_RECORDS_PRIVATE_STORAGE.md`
- `docs/HEALTHOS_RECORDS_SCHEMA.md`
- `docs/HEALTHOS_RECORDS_RLS.md`
- `docs/HEALTHOS_RECORDS_STORAGE_POLICY.md`
- `docs/HEALTHOS_RECORDS_SERVICE_IMPLEMENTATION.md`
- `docs/HEALTHOS_RECORD_LINKING_MODEL.md`
- `docs/HEALTHOS_RECORD_EXTRACTION_FOUNDATION.md`
- `docs/HEALTHOS_RECORDS_GENERATED_TYPES_STATUS.md`
- `docs/HEALTHOS_BATCH_4_UI_CONNECTIONS.md`
- `docs/HEALTHOS_EMERGENCY_PACKET_FOUNDATION.md`

## Files Updated

- None of the active Records or Scan screens were rewired.

## Existing Records / Documents / Storage Tables Found

- `medical_records`
- `medical_documents`
- `documents`

## Existing Storage Buckets / Path Patterns Found

- `medical-documents`: conflicting user-folder and family-folder policy history.
- `documents`: private bucket found, canonical path unclear.
- `profile-photos`, `profile-avatars`, `activity-photos`, `caregiver-uploads`, `fitness-assets`.
- Client-only references to `health-records-private`, `baby-records-private`, `medication-labels-private`, `supplement-labels-private`, `pregnancy-records-private`, and `ai-temp-uploads`.

## Migration Draft Status

Created. The draft is additive and was not applied.

## RLS Policy Draft Status

Created. Owner-first, with explicit shared read access through active `sharing_permissions`.

## Storage Policy Draft Status

Created for `health-records-private`. Legacy `medical-documents` policies were not changed.

## Generated Types Status

Stale. Local domain types were added until migration apply and type regeneration.

## Records Domain Types Status

Created in `src/features/records/recordTypes.ts`.

## Record Privacy Helpers Status

Created in `recordPrivacy.ts`.

## Record Storage Path Helpers Status

Created in `recordStoragePaths.ts`.

## Records Service Status

Created in `recordService.ts`. It returns `missingTable` when Batch 4 is unavailable and uses short-lived signed URLs only for owner-scoped private record paths.

## Records Hooks Status

Created hooks for record list, detail, files, links, and extractions.

## Records Realm Connection Status

Deferred. The current Records Realm remains local-storage-backed.

## Scan-To-Record Draft Status

Service helper created. UI wiring deferred.

## AI Extraction Metadata Foundation Status

Created as metadata-only `record_extractions`.

## Record Linking Model Status

Created as `record_links`.

## Emergency Packet Foundation Status

Created as `emergency_packet_items`.

## Deferred Items

- Applying migrations.
- Regenerating Supabase database types.
- Upload byte transfer.
- OCR and AI extraction execution.
- Active Records Realm read/write wiring.
- Scan route persistence.
- Medication, supplement, pregnancy, baby/child, women's health, and calendar writes.
- Legacy records/documents backfill.

## Typecheck Result

`npm run typecheck` passed.

## Risks / Blockers

- Existing `medical-documents` storage policies use conflicting path assumptions.
- Batch 4 migration depends on Batch 2 care profiles and Batch 3 sharing permissions.
- Generated database types are stale.
- Storage policies need local Supabase validation before upload UI is enabled.

## Next Recommended Backend Batch

Batch 5: calendar reminders and notification/reminder history after record metadata and explicit sharing are applied.
