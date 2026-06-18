# HealthOS AI Import Schema

AI output is stored as a candidate envelope, not final saved health data.

Envelope shape:

```json
{
  "type": "mealPlan",
  "title": "Privacy-safe title",
  "summaryPrivacySafe": "Short privacy-safe summary",
  "primaryTarget": "nutrition",
  "secondaryTargets": ["calendar"],
  "fields": [],
  "warnings": [],
  "sourceEvidence": [],
  "missingFields": [],
  "nextActions": []
}
```

Field shape: `key`, `label`, `value`, optional `unit`, `confidence`, `requiresReview`, and optional `targetField`.

Warning shape: `type`, `severity`, and `message`.

Evidence shape: `sourceType`, optional `label`, optional `summary`, and optional `sourceRecordId`. Storage paths are metadata only and should not be shown in normal UI.

Supported targets: nutrition, medication, supplements, records, fitness, calendar, reminders, pregnancy, babyChild, womensHealth, family, health, trustedContent, home, none.

Rules: unknown data normalizes to `unknown`/`none`; all health outputs require review; no target can auto-save; realm writes are deferred to separate reviewed import services.

