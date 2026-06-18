# HealthOS Fitness + Nutrition Record, Calendar, and Reminder Links

## Records

Supported candidate links:

- Record to workout plan candidate.
- Record to meal plan candidate.
- Scan/record to meal candidate.
- Scan/barcode to food item candidate.

Rules:

- Candidates remain draft/`needs_review`.
- Record links do not grant file access.
- Records RLS remains authoritative.

## Calendar and Reminders

Batch 9 stores link fields on `workout_sessions`:

- `linked_calendar_event_id`
- `linked_reminder_id`

Service helpers `createCalendarLinkCandidate` and `createReminderLinkCandidate` intentionally return `deferred`. A later UI flow must select reviewed source data and an explicit calendar/reminder target before saving the link.

No local notification scheduling or push backend work is included in Batch 9.
