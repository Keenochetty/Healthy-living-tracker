# HealthOS AI Import RLS

Batch 8 adds a local migration draft:

- `supabase/migrations/20260617203000_healthos_batch_8_ai_import_review.sql`

Created tables:

- `ai_extraction_jobs`
- `ai_import_envelopes`
- `ai_review_events`
- `ai_source_evidence`

RLS is enabled on each table. Policies are owner-only with `TO authenticated` plus `(select auth.uid())` ownership predicates.

Access model:

- Owners can select, insert, and update their own extraction jobs.
- Owners can select, insert, and update their own import envelopes.
- Owners can select and insert review events for their own envelopes.
- Owners can select and insert source evidence metadata.

No public reads are allowed. Family and caregiver access is intentionally not enabled by default because AI import candidates can contain private, unverified health data.

Existing related tables found:

- `app_ai_imports`: owner column `user_id`, payload JSON, status `confirmed|failed`, RLS owner-only.
- `healthsync_ai_imports`: owner column `user_id`, session link, status `pending|routed|saved|failed|cancelled`, RLS owner-only.
- `record_extractions`: owner column `owner_user_id`, record link, extracted JSON, review status, RLS tied to owned records.
- `app_ai_messages`, `ai_messages`: existing chat message history tables.

