# HealthOS Trusted Content Schema

## Canonical Decision

Canonical Batch 10 tables:

- `trusted_content_sources`
- `trusted_content_items`
- `trusted_content_targeting`
- `saved_content_items`
- `content_read_history`
- `content_feedback`

No applied equivalent was found in migrations. The old Phase 18 schema exists only as `docs/trusted-health-content-phase-18-schema.sql`.

## Source URL And Image Fields

- `trusted_content_sources.source_url`
- `trusted_content_items.source_url`
- `trusted_content_items.image_url`
- `saved_content_items.external_url`
- `saved_content_items.external_image_url`
- `content_read_history.external_url`

## Quality And Status Fields

- `source_quality`
- `medical_review_status`
- `ai_summary_status`
- `status`
- `published_at`
- `reviewed_at`
- `retrieved_at`

## Generated Types

Generated Supabase types do not include these tables yet. The service uses domain types and table-name casts until migrations are applied and types are regenerated.
