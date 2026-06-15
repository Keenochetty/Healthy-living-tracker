# Supabase Environment Plan

## Environments

- Local: local development only, no production data.
- Staging: separate Supabase project with fake/test data.
- Production: locked environment variables and least-privilege access.

## Separation Rules

- Separate Supabase projects.
- Separate API keys.
- Separate storage buckets.
- No production data in local.
- Staging tests must not use real family health data.
- Production service-role keys only in trusted backend/Edge Function settings.

## Dashboard Checks

- Confirm Data API exposure settings.
- Confirm RLS enabled on all sensitive tables.
- Confirm private storage buckets.
- Confirm storage policies on `storage.objects`.
- Confirm Auth settings and redirect URLs.
- Confirm backups/PITR plan for the subscription tier.
