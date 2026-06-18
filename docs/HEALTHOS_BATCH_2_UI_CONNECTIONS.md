# HealthOS Batch 2 UI Connections

## Status

No UI screen was rewired in this batch. The service and hooks are ready for read-only adoption once the migration is applied.

## Safe First Connections

- Profile/settings active care profile selector.
- Health Hub read-only active profile label.
- Family screen read-only care profile list.
- Baby/Child screen child identity selector.
- Pregnancy screen pregnancy-subject selector.

## Deferred

Writes from UI should wait until the migration is applied, database types are generated, and route-specific fallback behavior is confirmed.
