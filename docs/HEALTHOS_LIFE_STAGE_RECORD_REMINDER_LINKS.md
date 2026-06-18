# HealthOS Life-Stage Record / Reminder Links

Date: 2026-06-17

## Record Links

Life-stage rows may store `source_record_id` where the record is a source for the metadata:

- pregnancy scan or note to pregnancy profile/log/appointment
- vaccine card to vaccine record
- growth document to growth measurement
- child prescription to child medication note
- contraception note to contraception log

Record links do not grant file access. Record files still obey Records RLS and storage policy.

## Reminder Links

Reminder links are metadata only and must be review-first:

- pregnancy appointment reminder
- contraception renewal reminder
- vaccine record reminder
- child care routine reminder
- milestone follow-up reminder

Privacy-safe titles:

- `Pregnancy reminder`
- `Women's health reminder`
- `Child care reminder`
- `Vaccine record reminder`

No reminder is scheduled automatically.
