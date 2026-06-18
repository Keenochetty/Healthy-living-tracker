# HealthOS Batch 3 UI Connections

## Family Tab

Deferred. The target backend tables are draft-only until migration apply. The Family tab should be connected to `src/features/familySharing` after generated types are refreshed.

## Profile / Settings

Deferred. Existing settings rows can remain, but live permission management should wait for backend readiness.

## Health Hub

Deferred. Health Hub can later show real private/shared indicators from explicit permissions only.

## Baby / Child

Deferred. Child logs stay private. Only real permission status should be shown later.

## Pregnancy / Women’s Health

Deferred. Default remains private. No fake shared state should be shown.
