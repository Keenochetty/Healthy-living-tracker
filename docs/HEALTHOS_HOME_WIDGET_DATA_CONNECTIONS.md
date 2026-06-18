# HealthOS Home Widget Data Connections

Date: 2026-06-18

## Summary

Home currently uses real local/domain adapters for reminders, fitness, and nutrition summaries. Canonical Supabase-backed hooks are documented as the target, but broad replacement is deferred until generated Supabase types exist.

| Widget | Current Source | Canonical Target | Status | Fake Data Removed | Empty State | Risks |
| --- | --- | --- | --- | --- | --- | --- |
| Today Timeline | `getRemindersForDate`, `getFitnessCalendarReminders` | `useCalendarEvents`, `useReminders` | partial | none found | yes | calendar tables/types missing |
| Health Snapshot | active profile context plus summary props | account/care profile and health service status | partial | none found | yes | no vitals backend connected |
| Medication Due | existing widget state/copy | `useMedications`, `useReminders` | deferred | none found | yes | medication tables/types missing |
| Fitness / Nutrition | local fitness/nutrition summaries | `useFitnessGoals`, `useWorkoutPlans`, `useMealLogs`, `useMealPlans` | partial | none found | yes | fitness/nutrition tables/types missing |
| Family Pulse | current widget adapter | `useFamilyCircles`, `useFamilyMembers`, `useSharingPermissions` | deferred | no fake family names found | yes | family tables/types missing |
| AI Suggestion | quiet local widget | `useAIImportQueue` | deferred | no fake AI output added | yes | AI import tables/types missing |
| Upcoming Events | Home timeline slice | `useCalendarEvents`, `useReminders` | partial | none found | yes | calendar/reminder tables/types missing |
| Records Shortcut | shortcut widget | `useRecords` | deferred | none found | yes | records/storage tables/types missing |
| Trusted Content | route-level trusted content area | `useTrustedContentFeed` | deferred on Home | none found | yes | trusted content tables/types missing |

## Notes

The Home screen keeps this copy: widgets use empty states until real logs, reminders, records, and shared family data are available. That is consistent with Step 37.
