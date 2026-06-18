# HealthOS Service Result Standard

Date: 2026-06-18

## Shared Files

- `src/features/backend/backendTypes.ts`
- `src/features/backend/backendResult.ts`
- `src/features/backend/backendErrors.ts`
- `src/features/backend/serviceGuards.ts`

## Result Shapes

Single item services should use:

```ts
HealthOSServiceResult<T>
```

List services should use:

```ts
HealthOSListServiceResult<T>
```

Both include `data`, `status`, `error`, and optional `deferredReason`.

## Status Standard

The shared backend status union supports:

- `idle`
- `loading`
- `ready`
- `missingAuth`
- `missingTable`
- `missingTypes`
- `permissionDenied`
- `storageDeferred`
- `edgeFunctionMissing`
- `reviewRequired`
- `adminDeferred`
- `deferred`
- `error`

Feature-specific statuses can remain where active UI already depends on them, but new shared helpers should map to this standard.

## Error Normalization Rules

- UI-facing errors must be privacy-safe.
- Raw Supabase SQL, policy names, storage paths, tokens, and service internals must not be shown to users.
- Technical table names can appear in docs and developer-only audit output.
- Permission errors map to `permissionDenied`.
- missing table/schema errors map to `missingTable`.
- missing generated type coverage maps to `missingTypes`.

## Missing Table Behavior

Missing generated type coverage is not treated as successful empty data. It should return a `missingTypes`, `missingTable`, or `deferred` result with an honest `deferredReason`.

## Deferred Behavior

Deferred services should preserve enough information for UI to show an honest empty/deferred state without fake records or automatic writes.
