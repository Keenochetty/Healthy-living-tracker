# HealthOS Style Sheet 37 - Cross-Realm UI Data Connection Pass

## Purpose

Step 37 connects existing HealthOS routes and realm components to canonical service hooks where safe, and documents deferred states where backend tables or generated types are not ready.

## Scope

Allowed:

- Inspect active routes and HealthOS components.
- Replace fake/static health data with canonical service data where safe.
- Add loading, empty, error, deferred, permission, and review-required state helpers.
- Update imports to canonical feature indexes where safe.
- Document every route connection state.
- Run typecheck only.

Not allowed:

- UI redesign, new features, new tabs, migrations, remote Supabase commands, type generation, Edge Function deployment, package installs, seed/fake data, auto-writes on screen load, auto-imports, auto-scheduling, or full build/export.

## Verification

Run only:

```bash
npm run typecheck
```
