# HealthOS Record Linking Model

Date: 2026-06-17

## Table

`record_links` connects a private record to another HealthOS realm without writing into that realm.

Supported local realm labels:

- `records`
- `medication`
- `supplements`
- `pregnancy`
- `babyChild`
- `womensHealth`
- `calendar`
- `health`
- `aiImport`

## Privacy

Links are owner-managed. A shared record read does not automatically grant write access or downstream realm access.

## Deferred

- Medication/supplement label import writes.
- Pregnancy or baby/child document writes.
- Calendar reminder creation from records.
