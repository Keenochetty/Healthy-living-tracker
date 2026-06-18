# HealthOS Feature Service Exports Audit

Date: 2026-06-18

## Scope

Inspected feature folders:

- `src/features/account`
- `src/features/careProfiles`
- `src/features/familySharing`
- `src/features/records`
- `src/features/calendarReminders`
- `src/features/medicationSafety`
- `src/features/lifeStageHealth`
- `src/features/aiImport`
- `src/features/fitnessNutrition`
- `src/features/trustedContent`
- `src/features/backend`

## Feature Export Status

| Feature | Service File | Hooks | Index Export | Step 36 Status |
| --- | --- | --- | --- | --- |
| `account` | present | present | present | service exists; generated types missing |
| `careProfiles` | present | present | present | service exists; generated types missing |
| `familySharing` | present | present | present | service exists; generated types missing |
| `records` | present | present | present | service exists; generated types missing; storage metadata still depends on private storage policy readiness |
| `calendarReminders` | present | present | present | service exists; generated types missing |
| `medicationSafety` | present | present | present | service exists; generated types missing |
| `lifeStageHealth` | present | present | present | service exists; generated types missing |
| `aiImport` | present | present | present | service exists; review-first flow remains required |
| `fitnessNutrition` | present | present | present | service exists; generated types missing; uses typed domain wrappers with table casts |
| `trustedContent` | present | present | present | service exists; generated types missing; admin authoring remains deferred |
| `backend` | present | not applicable | present | shared Step 36 utilities added |

## Export Cleanup Notes

The canonical backend utility export is `src/features/backend/index.ts`.

No feature deletion was performed. Broad replacement of legacy imports was deferred because active app routes still depend on existing storage/service modules and this step is not allowed to redesign or rewire feature behavior aggressively.

## Fake Data / Sample Export Notes

`src/features/trustedContent/sampleEmptyStates.ts` remains exported by the trusted content feature index. It is treated as empty-state copy/data support, not seeded backend records. No new fake data was introduced in this step.

## Service Role Check

No client-side service-role key usage was added. Existing service-role references found are server-side Edge Function/admin documentation or SQL revoke statements, not Expo public client code.
