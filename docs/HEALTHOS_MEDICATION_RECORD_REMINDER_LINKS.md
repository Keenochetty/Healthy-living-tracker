# HealthOS Medication Record + Reminder Links

Date: 2026-06-17

## Record Links

Medication/supplement entries can reference `source_record_id`, but this does not grant file access or expose raw storage paths. Record file access still follows Records RLS and private storage rules.

Supported source records include:

- prescription
- medication label
- supplement label
- doctor note
- pharmacy note

## Reminder Links

Medication and supplement schedules can store `linked_reminder_id` from Batch 5. Linking does not schedule an OS notification.

Reminder links require reviewed schedules. Privacy-safe reminder titles should default to:

- "Medication reminder"
- "Supplement reminder"

## AI/Scan Candidates

AI/Scan can create medication or supplement candidates only as drafts that need review. They cannot activate entries, activate schedules, auto-create reminders, or auto-schedule notifications.
