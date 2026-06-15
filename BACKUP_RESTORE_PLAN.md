# Backup And Restore Plan

Supabase provides database backups by plan, but Storage objects are not included in database backups because the database stores only object metadata.

## Database

- Confirm daily backups in Supabase Dashboard.
- Consider Point-in-Time Recovery for production.
- Test restore process in staging.
- Document restore owner and approval path.
- Keep backup access limited to trusted admins.

## Storage

- Create separate storage export/backup plan.
- Periodically export private buckets to controlled backup storage.
- Preserve metadata: bucket, path, profile, realm, record ID, content type, original filename.
- Test restore of both database metadata and storage files together.

## Incident Recovery

- Identify affected profiles and categories.
- Disable compromised keys.
- Revoke exposed signed URLs where possible.
- Restore database and storage in staging first.
- Communicate according to legal/privacy requirements.
