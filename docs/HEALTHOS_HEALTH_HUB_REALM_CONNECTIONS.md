# HealthOS Health Hub Realm Connections

Date: 2026-06-18

## Summary

The Health Hub section metadata exists in `src/components/healthos/health/useHealthOSHealthSections.ts`. It is ready to display connected/deferred status, but generated Supabase table types are missing.

| Realm Card | Data Source Target | Count/Status Source | Private/Shared Indicator | Review Badge Source | Status |
| --- | --- | --- | --- | --- | --- |
| Records | `useRecords` | record count/review queue | records privacy helpers | record extractions/review status | deferred |
| Medication | `useMedications`, `useMedicationSchedules` | medication/schedule count | medication privacy helpers | medication review flags | deferred |
| Supplements | `useSupplements`, `useSupplementSchedules` | supplement/schedule count | medication privacy helpers | medication review flags | deferred |
| Fitness | `useFitnessGoals`, `useWorkoutPlans` | goals/plans/log count | fitness privacy helpers | nutrition/fitness review flags where relevant | deferred |
| Nutrition | `useNutritionGoals`, `useMealLogs` | goals/meals/plans count | nutrition privacy helpers | nutrition review flags | deferred |
| Pregnancy | `usePregnancyProfile`, `usePregnancyLogs` | profile/log status | life-stage privacy helpers | AI/scan review flow only | deferred |
| Women's Health | `useWomenHealthLogs`, `useContraceptionLogs` | log count/status | private by default | AI/scan review flow only | deferred |
| Baby/Child | child care, feeding, sleep, diaper, growth, vaccine, milestone hooks | child log count/status | guardian/explicit permission only | AI/scan review flow only | deferred |
| Calendar/Reminders | `useCalendarEvents`, `useReminders` | event/reminder count | reminder privacy helpers | review-needed reminders | deferred |
| AI Imports | `useAIImportQueue` | review queue count | private import context | import review events | deferred |
| Trusted Content | `useTrustedContentFeed` | content count | not medical record sharing | content review queue | deferred |
| Family Sharing | `useFamilyCircles`, `useSharingPermissions` | member/permission count | explicit permission only | invite/permission review | deferred |

## Deferred Reason

Every canonical backend table remains missing from generated Supabase types. Health Hub should therefore show honest deferred or empty states rather than invented health counts.
