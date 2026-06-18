# HealthOS Medication Generated Types Status

Date: 2026-06-17

Generated Supabase types are stale for Batch 6. Checked-in `src/types/database.ts` does not include canonical medication/supplement table rows, inserts, or updates.

Current decision:

- Use domain types under `src/features/medicationSafety`.
- Keep service methods tolerant of missing tables/columns.
- Regenerate Supabase types after applying the Batch 6 migration.
- Do not run remote type generation in this batch.
