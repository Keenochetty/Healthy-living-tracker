# HealthOS AI Import Generated Types Status

`src/types/database.ts` does not include Batch 8 tables.

Missing generated table types:

- `ai_extraction_jobs`
- `ai_import_envelopes`
- `ai_review_events`
- `ai_source_evidence`

Existing generated/local type coverage is partial and manual. Batch 8 uses domain types in `src/features/aiImport/aiImportTypes.ts` and dynamic Supabase table access to avoid breaking typecheck before remote type generation.

After applying the migration in a controlled Supabase workflow, regenerate database types and replace dynamic table calls with generated row/insert/update types.

