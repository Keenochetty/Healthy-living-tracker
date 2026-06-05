# Security Release Checklist

- RLS enabled on all sensitive tables.
- RLS policies tested for owner, shared user, caregiver, parent/guardian, adult conversion, and denied user.
- Storage buckets private.
- Storage RLS policies tested.
- Signed URLs are short-lived and permission-checked.
- No service-role key in frontend/mobile app.
- `.env` files ignored.
- Edge Functions validate JWT and permissions.
- Audit logs work for sensitive access/change.
- Backups and storage backup plan documented.
- Export/delete placeholders reviewed.
- Staging tested with fake data.
- Security docs complete.
- Privacy policy/legal review pending.
- App Store privacy checklist complete.
- Google Play Data Safety checklist complete.
