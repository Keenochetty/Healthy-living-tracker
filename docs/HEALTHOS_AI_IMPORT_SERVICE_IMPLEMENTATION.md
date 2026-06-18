# HealthOS AI Import Service Implementation

Created canonical Batch 8 service files under `src/features/aiImport/`:

- `aiImportTypes.ts`
- `aiImportDefaults.ts`
- `aiImportTargets.ts`
- `aiImportSafety.ts`
- `aiImportSchema.ts`
- `aiImportMappers.ts`
- `aiImportValidation.ts`
- `aiImportService.ts`
- `useAIImportQueue.ts`
- `useAIImportEnvelope.ts`
- `useAIReviewEvents.ts`
- `useAIExtractionJob.ts`

Service methods include current user lookup, queue reads, envelope reads, extraction job creation/status updates, envelope creation/updates, review status helpers, review events, source evidence, Scan/Record/Chat candidate creation, and Edge Function invocation.

Status behavior:

- Missing auth returns `missingAuth`.
- Missing Batch 8 tables return `missingTable`.
- Missing or failed Edge Function calls return `edgeFunctionMissing`.
- Import attempts before review return `reviewRequired`.

Generated types are stale for Batch 8, so the service uses domain types and a narrow dynamic table helper. Regenerate Supabase types after the migration is applied.

