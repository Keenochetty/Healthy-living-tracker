# HealthOS Backend Implementation Decisions

Date: 2026-06-17

## Decisions For MVP Planning

- Build backend in small additive batches.
- Do account/preferences before care-subject normalization.
- Do family permissions before shared records.
- Do records/storage before scan-to-records writes.
- Do reminder source/history before AI-created reminder drafts.
- Do AI import review persistence before importing health plans into realm tables.
- Keep trusted content persistence after core health data unless it is required for MVP.

## Intentionally Deferred

- Destructive profile/person split.
- Table renames.
- Data backfills.
- Full push backend.
- Billing/subscriptions.
- Device integrations.
- Offline sync.

## Do Not Build Yet

- Broad RLS policies.
- Backend writes from UI screens whose tables/RLS/types are missing.
- Fake seed data to simulate real persistence.
- AI auto-save into medical records, reminders, medications, or plans.

