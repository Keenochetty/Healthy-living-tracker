# HealthOS Cross-Realm Empty And Deferred States

Date: 2026-06-18

## Shared State Layer

Added `src/features/uiConnection` with:

- `HealthOSUIConnectionState`
- `HealthOSUIConnectionSummary`
- `HEALTHOS_UI_CONNECTION_COPY`
- `mapBackendStatusToUIConnectionState`
- `createUIConnectionSummary`
- `useRealmConnectionState`

## Shared Copy

| State | Copy |
| --- | --- |
| loading | Loading your data... |
| ready | Connected. |
| empty | Nothing added yet. |
| deferred | This feature is not connected yet. |
| error | Couldn't load this right now. |
| permissionRequired | You do not have access to this yet. |
| reviewRequired | Review before saving. |

## Backend Mapping

- `missingTable`, `missingTypes`, `storageDeferred`, `edgeFunctionMissing`, `adminDeferred`, and `deferred` map to UI `deferred`.
- `missingAuth` and `permissionDenied` map to UI `permissionRequired`.
- `reviewRequired` maps to UI `reviewRequired`.
- `ready` with an empty array maps to UI `empty`.

## No Fake Data Rule

Where backend tables/types are missing, screens should show empty/deferred copy and keep layout structure. They should not invent counts, family members, medications, records, pregnancy data, cycle predictions, child logs, workouts, meals, calories, or articles.
