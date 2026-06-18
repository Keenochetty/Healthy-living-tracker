# HealthOS Women's Health Privacy Model

Date: 2026-06-17

## Tables

- `women_health_logs`: private cycle, bleeding, mood, symptom, pain, temperature text, and note metadata.
- `contraception_logs`: private contraception method and renewal metadata.
- `sex_day_logs`: strictly private sex-day logs.

## Rules

Cycle data is private by default. Any future predictions must be marked estimated and must not be presented as medical fact.

Contraception rows store notes and reminders only. HealthOS does not recommend contraception choices.

Sex-day logs must never appear in family, caregiver, shared timeline, or generic family-summary contexts by default.
