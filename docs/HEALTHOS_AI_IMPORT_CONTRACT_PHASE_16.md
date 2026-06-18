# HealthOS AI Import Contract Phase 16

Date: 2026-06-17

## Files Inspected

- `src/app/ai/index.tsx`
- `src/app/ai/review/[jobId].tsx`
- `src/lib/aiBackend.ts`
- `src/lib/appAIImport.ts`
- `src/types/appAI.ts`
- `src/components/healthos/scan/HealthOSExtractionPreview.tsx`
- `src/components/ai/AiInputPickerCard.tsx`
- `package.json`
- `supabase/functions/ai-chat/index.ts`

## Files Created

- `src/features/aiImport/types.ts`
- `src/features/aiImport/importTargets.ts`
- `src/features/aiImport/fieldDefinitions.ts`
- `src/features/aiImport/safetyRules.ts`
- `src/features/aiImport/validators.ts`
- `src/features/aiImport/normalizers.ts`
- `src/features/aiImport/adapters.ts`
- `src/features/aiImport/sampleEmptyStates.ts`
- `src/features/aiImport/index.ts`
- `src/components/healthos/aiImport/HealthOSAIImportReviewScreen.tsx`
- `src/components/healthos/aiImport/HealthOSAIImportReviewSheet.tsx`
- `src/components/healthos/aiImport/HealthOSAIImportHeader.tsx`
- `src/components/healthos/aiImport/HealthOSAIImportTargetPicker.tsx`
- `src/components/healthos/aiImport/HealthOSAIImportFieldReviewList.tsx`
- `src/components/healthos/aiImport/HealthOSAIImportFieldRow.tsx`
- `src/components/healthos/aiImport/HealthOSAIConfidenceBadge.tsx`
- `src/components/healthos/aiImport/HealthOSMissingFieldsCard.tsx`
- `src/components/healthos/aiImport/HealthOSSourceEvidenceList.tsx`
- `src/components/healthos/aiImport/HealthOSImportWarningsCard.tsx`
- `src/components/healthos/aiImport/HealthOSImportSafetyNotice.tsx`
- `src/components/healthos/aiImport/HealthOSImportActionBar.tsx`
- `src/components/healthos/aiImport/HealthOSImportHistoryCard.tsx`
- `src/components/healthos/aiImport/useHealthOSAIImportReview.ts`
- `src/components/healthos/aiImport/index.ts`
- `src/app/ai/import-review.tsx`
- `docs/style-sheets/HEALTHOS_STYLE_SHEET_16_AI_IMPORT_CONTRACT.md`

## Files Updated

- `src/components/healthos/index.ts`

## Existing AI / Scan Extraction Flow Found

- `src/lib/aiBackend.ts` calls Supabase Edge Functions `ai-extract`, `ai-chat`, and `health-assistant`.
- `src/app/ai/review/[jobId].tsx` reviews older `AiJob` drafts.
- `src/lib/appAIImport.ts` contains older direct save handlers for selected AppAI targets.
- `src/components/healthos/scan/HealthOSExtractionPreview.tsx` already states that structured results require review.

## Backend / Edge Function Status

- Existing AI backend stays in Supabase Edge Functions.
- No backend function was changed.
- No deployment command was run.

## Implementation Status

- AI import envelope: implemented in `types.ts`.
- Import target registry: implemented in `importTargets.ts`.
- Field review model: implemented in `types.ts` and `fieldDefinitions.ts`.
- Evidence/source model: implemented in `types.ts`.
- Safety/warning model: implemented in `types.ts` and `safetyRules.ts`.
- Validation strategy: Zod schemas and helper functions in `validators.ts`.
- Normalizers: implemented for existing AppAI payloads, chat results, scan results, records extraction, and unknown results.
- Review UI: reusable screen and sheet implemented.
- Realm adapter foundation: implemented with existing AppAI save handler awareness, but new envelope imports remain deferred until a safe reviewed adapter maps payloads.

## Integration Status

- Optional route: `src/app/ai/import-review.tsx`.
- Scan integration: deferred; shared sheet is available.
- AI page integration: deferred; shared normalizer is available.
- Records integration: deferred; shared review components are available.

## Save / Import Handler Status

- Existing legacy handlers were detected in `src/lib/appAIImport.ts`.
- The new contract does not call them directly because envelope-to-legacy mapping needs a reviewed adapter per target.
- No AI output is auto-saved.

## API Key / Client Secret Safety

- No API keys or secrets were added to Expo client code.
- Existing code calls Supabase functions from the client; OpenAI secrets remain backend-only.

## What Was Not Implemented

- No new database tables.
- No new storage buckets.
- No backend changes.
- No automatic calendar scheduling.
- No automatic medication reminders.
- No automatic family sharing.
- No direct realm writes from the new envelope.

## Verification

- Typecheck: passed with `npm run typecheck`.

## Risks

- The old `importAppAIData` path can write directly when called by existing UI. This phase adds the safer shared contract but does not remove old behavior.
- Full scan/chat/records integration should be done in a follow-up pass with targeted UI changes.

## Next Recommended Phase

- Wire Scan, AI chat result cards, and Records extraction queue to open `HealthOSAIImportReviewSheet` using the new normalizers.
