# HealthOS AI Import Review Flow

Lifecycle:

1. User initiates AI work from Chat, Scan, Records, or a realm.
2. App creates or receives an extraction job.
3. AI output becomes an import envelope with fields, warnings, missing fields, and evidence metadata.
4. User opens review.
5. User marks in review, edits fields, acknowledges warnings, reviews, dismisses, or later imports.

No auto-save rule:

- AI cannot create active medications.
- AI cannot create reminders or calendar events.
- AI cannot create pregnancy, baby/child, women health, nutrition, fitness, family, records, or trusted content rows as final data.

Batch 8 UI connection:

- `/ai/import-review` now shows real queue status when no id is supplied.
- `/ai/import-review?id=...` can open a persisted envelope by id and pass privacy-safe metadata into the existing review screen.
- Detailed field editing remains tied to the existing UI-oriented envelope contract and is partially deferred until persisted envelope fields are fully mapped into that component.

