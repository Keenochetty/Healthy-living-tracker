# HealthOS Backend Table Registry

Date: 2026-06-18

## Summary

The canonical registry is implemented in `src/features/backend/tableRegistry.ts`.

Registry entry shape is defined in `src/features/backend/backendTypes.ts` and includes:

- `tableName`
- `batch`
- `featureArea`
- `generatedTypeStatus`
- `serviceStatus`
- `routeStatus`
- `rlsStatus`
- `notes`

## Registry Status

All planned MVP tables are registered. Every entry is currently marked:

- `generatedTypeStatus`: `missing`
- `serviceStatus`: `wired`
- `routeStatus`: `deferred`
- `rlsStatus`: `drafted`

This reflects the current repo state: migration files and service layers exist, but generated Supabase schema types were not found and broad route rewiring is not safe until migrations/types are confirmed.

## Feature Area Mapping

| Batch | Feature Area | Registry Status |
| --- | --- | --- |
| 1 | `account` | registered |
| 2 | `careProfiles` | registered |
| 3 | `familySharing` | registered |
| 4 | `records` | registered |
| 5 | `calendarReminders` | registered |
| 6 | `medicationSafety` | registered |
| 7 | `lifeStageHealth` | registered |
| 8 | `aiImport` | registered |
| 9 | `fitnessNutrition` | registered |
| 10 | `trustedContent` | registered |

## Safe Usage

Consumers should use `getBackendTableRegistryEntry`, `isTableGenerated`, `getTableAvailability`, `getMissingTableDeferredReason`, or `shouldUseDeferredService` from `src/features/backend`.

Until generated types exist, feature services should return `missingTypes`, `missingTable`, or `deferred` rather than claiming table coverage is ready.
