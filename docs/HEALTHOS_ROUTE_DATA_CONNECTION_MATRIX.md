# HealthOS Route Data Connection Matrix

Date: 2026-06-18

## Summary

Step 37 inspected the active HealthOS routes and the matching `src/components/healthos` component hooks. Because Step 36 found no generated Supabase `Database` type file, canonical Supabase-backed route wiring remains mostly deferred. Existing local/domain storage adapters were left in place where replacing them would risk behavior changes.

## Matrix

| Route / Area | Component File | Current Data Source | Canonical Target | Status | Empty/Deferred State | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| `src/app/(tabs)/today.tsx` / Home | `src/components/healthos/home/HealthOSHomeScreen.tsx` | local reminder, fitness, nutrition adapters | `calendarReminders`, `medicationSafety`, `records`, `familySharing`, `aiImport`, `fitnessNutrition`, `trustedContent` | partial | present | Existing widgets show empty states; canonical Supabase hooks deferred by missing generated types. |
| `src/app/(tabs)/calendar.tsx`, `src/app/health-calendar/index.tsx` | `src/components/healthos/calendar/HealthOSCalendarScreen.tsx` | local reminders, fitness reminders, women's health overlays | `useCalendarEvents`, `useReminders` | partial | present | No auto-scheduling added. |
| `src/app/(tabs)/scan.tsx` | `src/components/healthos/scan/HealthOSScanCameraScreen.tsx` | scan UI state and review flow | `aiImport` hooks | partial | present | Review-first behavior preserved. |
| `src/app/ai/import-review.tsx` | `src/components/healthos/aiImport/HealthOSAIImportReviewScreen.tsx` | AI import review adapter | `useAIImportQueue`, `useAIImportEnvelope`, `useAIReviewEvents` | partial | present | No direct final save added. |
| `src/app/(tabs)/health.tsx`, `src/app/health/[realm].tsx` | `src/components/healthos/health/HealthOSHealthHubScreen.tsx` | HealthOS section metadata and realm adapters | all feature indexes | partial | present | Counts remain conservative; no fake health counts added. |
| `src/app/(tabs)/circle.tsx`, `src/app/circle/member/[memberId].tsx` | `src/components/healthos/family/HealthOSFamilyCircleScreen.tsx` | `src/lib/familyPermissionsStorage` | `useFamilyCircles`, `useFamilyMembers`, `useSharingPermissions`, `useCaregiverAssignments` | partial | present | Existing privacy gate retained; no medical detail exposed by membership alone. |
| `src/app/records/index.tsx` | `src/components/healthos/records/HealthOSRecordsRealmScreen.tsx` | `src/lib/healthRecordsStorage` | `useRecords`, `useRecordFiles`, `useRecordLinks`, `useRecordExtractions` | partial | present | Raw storage paths are not surfaced in the HealthOS records UI. |
| `src/app/medication/index.tsx`, `src/app/supplements/index.tsx` | realm screens and medication components | existing local/domain medication flows | `medicationSafety` hooks | deferred | present | No dosage advice, interaction claims, or auto-scheduling added. |
| `src/app/pregnancy/index.tsx` | `src/components/healthos/pregnancy/HealthOSPregnancyRealmScreen.tsx` | pregnancy realm adapter | `usePregnancyProfile`, `usePregnancyLogs` | partial | present | No fake pregnancy week added. |
| `src/app/cycle/index.tsx` | `src/components/healthos/womensHealth/HealthOSWomenHealthRealmScreen.tsx` | women's health adapter | `useWomenHealthLogs`, `useContraceptionLogs` | partial | present | Sex-day data remains private. |
| `src/app/baby-child/index.tsx` | `src/components/healthos/babyChild/HealthOSBabyChildRealmScreen.tsx` | baby/child adapter | life-stage hooks | partial | present | No growth percentile or vaccine recommendation engine added. |
| `src/app/(tabs)/fitness.tsx`, `src/app/fitness/*` | `src/components/healthos/fitness/HealthOSFitnessRealmScreen.tsx` | fitness storage/services | `fitnessNutrition` hooks | partial | present | No fake PBs or streaks added. |
| `src/app/(tabs)/food.tsx`, `src/app/food/*` | `src/components/healthos/nutrition/HealthOSNutritionRealmScreen.tsx` | nutrition storage/services | `fitnessNutrition` nutrition hooks | partial | present | No fake calories/macros added. |
| `src/app/trusted-content/index.tsx` | `src/components/healthos/trustedContent/HealthOSTrustedContentHubScreen.tsx` | trusted content storage plus feature normalizers | `useTrustedContentFeed`, `useSavedContent` | partial | present | No fake articles added. |
| `src/app/reminders/index.tsx`, `src/app/reminders/[reminderId].tsx` | reminder route components | reminder engine/storage | `calendarReminders` hooks | partial | present | No notification permission request or auto-scheduling added. |
| `src/app/settings/index.tsx` | `src/components/healthos/settings/HealthOSProfileControlPanelScreen.tsx` | profile/settings adapters | `account`, `careProfiles`, `familySharing` | partial | present | Privacy/settings controls remain local/domain-driven. |

## Connection Decision

No broad route import rewrite was performed. The safe Step 37 connection added in code is the shared UI connection state layer in `src/features/uiConnection`, which maps backend statuses to route-safe `loading`, `ready`, `empty`, `deferred`, `error`, `permissionRequired`, and `reviewRequired` states.
