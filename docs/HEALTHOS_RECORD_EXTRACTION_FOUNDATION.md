# HealthOS Record Extraction Foundation

Date: 2026-06-17

## Table

`record_extractions` stores review-first extraction metadata.

Fields include:

- `record_id`
- `record_file_id`
- `source_type`
- `review_status`
- `extracted_fields`
- `warnings`
- `confidence`
- `model_label`

## Rules

Extraction metadata is owner-managed and does not directly mutate health, medication, pregnancy, baby/child, calendar, or reminder tables.

## Deferred

- OCR execution.
- AI model execution.
- Import approval writes.
- Extraction history UI wiring.
