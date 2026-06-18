# HealthOS Style Sheet 36 - Supabase Types + Service Wiring Cleanup

## Purpose

Step 36 is a backend/service cleanup and wiring pass. It audits generated Supabase type coverage, backend table coverage, shared service result patterns, missing-table/deferred handling, feature exports, duplicate services, route/service wiring, and TypeScript safety.

## Scope

Allowed:

- Inspect generated Supabase type files.
- Inspect feature service folders from previous backend batches.
- Create shared backend result, table registry, table availability, and service guard utilities.
- Update docs explaining type coverage, service wiring, duplicate services, and deferred backend behavior.
- Run typecheck only.

Not allowed:

- New migrations, migration application, remote Supabase type generation, Edge Function deployment, package installs, seed/fake data, UI redesign, full build/export, or service-role/client secret usage.

## Verification

Run only:

```bash
npm run typecheck
```

Do not run:

```bash
supabase db push
supabase migration up
supabase gen types
supabase functions deploy
eas build
npm run build
npx expo export
```
