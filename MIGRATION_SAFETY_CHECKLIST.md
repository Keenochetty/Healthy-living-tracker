# Migration Safety Checklist

- Every new table has an RLS decision.
- Every sensitive table enables RLS.
- Every sensitive table has owner/profile/permission policies.
- Every policy uses `TO authenticated` plus authorization predicates, not role-only checks.
- UPDATE policies include `USING` and `WITH CHECK`.
- Columns used in RLS have indexes.
- Tables include `created_at` and `updated_at` where useful.
- Migrations are committed; avoid dashboard-only production changes.
- Test locally and staging before production.
- Never drop production columns without backup and rollback notes.
- Avoid broad `select *` views over sensitive tables.
- Keep `SECURITY DEFINER` functions minimal, schema-qualified, and reviewed.
