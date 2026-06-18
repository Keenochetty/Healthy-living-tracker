# HealthOS Calendar + Reminders RLS

Date: 2026-06-17

## Policy Approach

Batch 5 adds conservative owner-only policies for canonical ownership columns. It does not remove legacy calendar/reminder policies because doing so could break existing active screens before the full schema cutover.

## Created Draft Policies

`calendar_events`:

- Owner can select rows where `owner_user_id = auth.uid()`.
- Owner can insert rows with `owner_user_id = auth.uid()`.
- Owner can update rows they own, with matching `WITH CHECK`.
- Owner can delete rows they own.

`calendar_event_links`:

- Owner can read/update/delete own links.
- Owner can insert links only when the linked calendar event is also owned by that user.

`reminders`:

- Owner can select/insert/update/delete own canonical reminders.

`reminder_history`:

- Owner can read own history.
- Owner can insert history only for reminders they own.

`notification_events`:

- Owner can read, insert, and update own notification events.

## Deferred Shared Access

Family/caregiver access remains deferred for calendar/reminder details. Family membership alone is not enough for private health reminders because it can expose medication, pregnancy, baby/child, women health, records, or AI-derived details.

## Existing Risk

Legacy `calendar_events` and `reminders` already have broader family/helper policies from earlier migrations. Batch 5 adds safer canonical owner policies but does not tighten those older policies. A later hardening pass should review and replace legacy broad policies after active screens are moved to the canonical columns.
