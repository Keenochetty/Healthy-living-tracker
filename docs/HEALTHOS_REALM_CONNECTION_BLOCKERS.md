# HealthOS Realm Connection Blockers

Date: 2026-06-18

## Primary Blocker

No generated Supabase `Database` type file exists. Step 36 documented all planned backend tables as missing from generated types.

## Route Wiring Blockers

- Canonical services target planned tables that cannot be verified through generated types.
- Several active routes still use legacy local/domain storage modules.
- Replacing route data sources all at once would risk behavior regressions.
- Storage metadata and private file access require policy verification before route-level file display is expanded.
- Family/caregiver data must stay permission-scoped before cross-realm medical details are exposed.

## Recommended Unblock Sequence

1. Apply/verify migrations outside this step.
2. Regenerate Supabase types.
3. Update `src/features/backend/tableRegistry.ts` from generated coverage.
4. Migrate one route group at a time from local/domain adapters to canonical feature hooks.
5. Run typecheck after each route group.
