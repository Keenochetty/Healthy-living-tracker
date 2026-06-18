# HealthOS Trusted Content RLS

## Reference Tables

`trusted_content_sources`, `trusted_content_items`, and `trusted_content_targeting` have authenticated read policies for active/published content only.

Client insert/update/delete policies for global content are deferred until a content admin and moderation model exists.

## Private User Tables

`saved_content_items`:

- Owner can select, insert, update, and delete own rows.
- No public or family/caregiver reads.

`content_read_history`:

- Owner can select and insert own rows.
- No family/caregiver reads.

`content_feedback`:

- Owner can select and insert own feedback.
- No public feedback reads.

## Exclusions

- No `using true` on private saved/read/feedback tables.
- No public write policies.
- No service-role client path.
