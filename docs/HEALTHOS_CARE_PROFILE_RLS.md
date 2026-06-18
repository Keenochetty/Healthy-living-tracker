# HealthOS Care Profile RLS

## Policy Model

- Authenticated users can read care profiles they own, manage, or are actively related to.
- Authenticated users can create only their own care profiles.
- Owners, managers, and adult owners can update care profile identity metadata.
- Relationship rows are writable only by a user who owns or manages the target care profile.
- Active profile preference rows are restricted to `user_id = auth.uid()`.

## Security Notes

- Policies use `TO authenticated` with ownership predicates.
- Update policies include both `USING` and `WITH CHECK`.
- No service role key is used by the client.
- No delete policies were added in this batch.

## Known Review Point

The relationship table is intentionally narrow. Full realm permissions still belong to a later sharing/permissions batch.
