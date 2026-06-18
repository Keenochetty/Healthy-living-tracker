# HealthOS Calendar + Reminders Generated Types Status

Date: 2026-06-17

Generated Supabase types are stale for Batch 5. The new `calendar_event_links`, `reminder_history`, and `notification_events` tables are not represented in checked-in generated types, and existing `calendar_events`/`reminders` types do not yet include all canonical columns.

Current decision:

- Use frontend domain types in `src/features/calendarReminders`.
- Keep service methods tolerant of missing tables/columns.
- Regenerate Supabase types after applying the Batch 5 migration.
- Do not run remote type generation in this batch.
