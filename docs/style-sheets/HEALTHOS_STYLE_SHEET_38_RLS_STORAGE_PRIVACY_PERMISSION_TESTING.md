# HealthOS Style Sheet 38 - RLS, Storage, Privacy + Permission Testing Pass

## Purpose

Step 38 audits local RLS policy SQL, storage policy SQL, privacy boundaries, family/caregiver permissions, child/guardian access, AI import boundaries, notification privacy, shared-context UI, service guards, and review-first flows.

## Scope

Allowed:

- Inspect local migrations, functions, docs, service guards, privacy helpers, storage helpers, and shared-context UI.
- Create audit matrices, privacy test case docs, SQL example docs, and a fix backlog.
- Make small safe code guard/error-normalization fixes.
- Run typecheck only.

Not allowed:

- New product features, UI redesign, migrations, migration application, remote Supabase commands, SQL tests, bucket creation, production policy changes, type generation, Edge Function deploys, package installs, fake data, seed data, or full build/export.

## Verification

Run only:

```bash
npm run typecheck
```
