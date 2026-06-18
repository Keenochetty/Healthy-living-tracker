# HealthOS Backend Batch 8 - AI Import Review Persistence + Edge Function Hardening

Date: 2026-06-17

## Files Inspected

- Attachments for Style Sheet 33 and implementation instructions.
- `src/features/aiImport/*`
- `src/components/healthos/aiImport/*`
- `src/app/ai/import-review.tsx`
- `src/app/ai/review/[jobId].tsx`
- `src/lib/supabase.ts`
- `src/services/fitnessAiImportService.ts`
- `src/types/database.ts`
- `.env.example`
- `package.json`
- `supabase/migrations/*`
- `supabase/functions/ai-chat/index.ts`
- `supabase/functions/ai-extract/index.ts`
- `supabase/functions/ai-assistant/index.ts`
- `supabase/functions/ai-document-extraction/index.ts`
- `supabase/functions/_shared/security.ts`
- Prior backend docs for batches 1-7 and schema/data model maps.

## Files Created

- `supabase/migrations/20260617203000_healthos_batch_8_ai_import_review.sql`
- `src/features/aiImport/aiImportTypes.ts`
- `src/features/aiImport/aiImportDefaults.ts`
- `src/features/aiImport/aiImportTargets.ts`
- `src/features/aiImport/aiImportSafety.ts`
- `src/features/aiImport/aiImportSchema.ts`
- `src/features/aiImport/aiImportMappers.ts`
- `src/features/aiImport/aiImportValidation.ts`
- `src/features/aiImport/aiImportService.ts`
- `src/features/aiImport/useAIImportQueue.ts`
- `src/features/aiImport/useAIImportEnvelope.ts`
- `src/features/aiImport/useAIReviewEvents.ts`
- `src/features/aiImport/useAIExtractionJob.ts`
- `supabase/functions/healthos-ai-import/index.ts`
- `supabase/functions/healthos-ai-import/importSchema.ts`
- `supabase/functions/healthos-ai-import/safety.ts`
- `supabase/functions/healthos-ai-import/README.md`
- Batch 8 docs listed in the style sheet.

## Files Updated

- `.env.example`
- `src/app/ai/import-review.tsx`
- `src/features/aiImport/index.ts`
- `supabase/functions/ai-chat/index.ts`
- `supabase/functions/ai-extract/index.ts`

## Existing AI / Chat / Import Tables Found

- `ai_messages`: legacy AI message model, RLS enabled in older migrations.
- `app_ai_chats`, `app_ai_messages`, `app_ai_imports`, `app_ai_actions`, `app_ai_scan_results`: owner column `user_id`, RLS owner-only.
- `healthsync_ai_sessions`, `healthsync_ai_imports`: owner column `user_id`, RLS owner-only.
- `record_extractions`: owner column `owner_user_id`, `record_id`, `record_file_id`, `extracted_fields`, `review_status`, RLS tied to owned records.
- Final realm tables already exist for records, calendar, reminders, medications, supplements, pregnancy, women health, child care, and care profiles.

## Existing AI Edge Functions Found

- `ai-chat`: server-side OpenAI call through `OPENAI_API_KEY`.
- `ai-extract`: prior mock/deferred extractor.
- `ai-assistant`: authenticated placeholder.
- `ai-document-extraction`: authenticated placeholder.

## Migration Draft

Created. It is local only and not applied.

Tables: `ai_extraction_jobs`, `ai_import_envelopes`, `ai_review_events`, `ai_source_evidence`.

## RLS Policy Draft

Created. Owner-only, no public reads, no family/caregiver reads by default.

## Generated Types Status

Generated database types are stale for Batch 8. Domain types were added and remote type generation was not run.

## AI Import Domain Types Status

Implemented in `aiImportTypes.ts`.

## AI Import Schema / Validation Status

Implemented with lightweight TypeScript helpers. No new validation package added.

## AI Import Safety Helpers Status

Implemented conservative helpers. Unknown and high-sensitivity targets require review.

## AI Import Service Status

Implemented review-first service methods. Service returns `missingAuth`, `missingTable`, `edgeFunctionMissing`, `reviewRequired`, or `error` without exposing raw Supabase/provider errors.

## AI Import Hooks Status

Implemented queue, envelope, review events, and extraction job hooks. No fake imports are created.

## Edge Function Hardening Status

- `ai-chat` now validates target/context and returns privacy-safe provider errors.
- `ai-extract` now requires auth/context confirmation and returns deferred output instead of mock drafts.
- `healthos-ai-import` local draft added and not deployed.

## Secrets / Environment Status

`.env.example` includes server-only placeholders for `OPENAI_API_KEY`, `HEALTHOS_AI_MODEL`, and `HEALTHOS_AI_IMPORT_MODEL`. No real secrets were added.

## AI Page Connection Status

Deferred. No AI Page redesign was done.

## AI Import Review Connection Status

Partially connected. The route shows real queue status and can read persisted envelope metadata by id. Full persisted field editing remains deferred.

## Scan / Records Import Candidate Status

Service methods exist for scan and record candidates. UI buttons are deferred.

## Realm Candidate Visibility Status

Deferred. No realm badge/candidate UI was added.

## Auto-save Prevention Status

The new Batch 8 path only creates jobs, envelopes, review events, and evidence metadata. It does not write final realm rows.

Existing pre-Batch-8 risk: `src/services/fitnessAiImportService.ts` can create `user_imported_plans` draft rows and has fallback plan data. It was not rewired in this batch to avoid breaking an existing feature, and is documented as a separate follow-up.

## Deferred Items

- Apply migration.
- Regenerate Supabase types.
- Deploy Edge Functions and configure secrets.
- Persist provider output server-side.
- Full UI mapping from persisted envelope fields into the review screen.
- Scan/Records/realm button wiring.
- OCR, voice, diagnosis, medication advice, child dosage, pregnancy risk scoring.

## Typecheck Result

Passed.

Command run:

```bash
npm run typecheck
```

## Risks / Blockers

- Generated database types do not include Batch 8 tables.
- Multiple historical AI import models still exist.
- Existing fitness AI import service predates the review envelope model.

## Next Recommended Backend Batch

Backend Batch 9 should apply the migration in a controlled Supabase workflow, regenerate database types, and connect Scan/Records/AI Chat to persisted envelopes end to end.
