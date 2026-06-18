# HealthOS Batch 5 UI Connections

Date: 2026-06-17

## Calendar

Deferred. The active Health Calendar currently uses local reminder/calendar helpers. It should not switch to Batch 5 backend data until migration/type generation are complete.

## Reminder Center

Deferred. The active Reminder Center currently uses local reminder engine and existing notification service. Batch 5 backend hooks are ready but not wired into the active UI.

## Home Upcoming Events/Reminders

Deferred. No fake counts or placeholder upcoming items were added.

## AI/Scan Candidates

Backend service methods exist for review-first candidates. Active AI/Scan persistence is deferred until the AI import batch can wire the full review flow safely.

## Source Realms

Medication, supplements, pregnancy, baby/child, women health, records, fitness, nutrition, family, and caregiver source writes are deferred.
