# HealthOS Route Service Wiring Audit

Date: 2026-06-18

## Summary

Route wiring remains intentionally conservative. Generated Supabase types are missing, so active screens should not be broadly switched to new backend services in this step.

## Route Status

| Area | Current Wiring Status | Canonical Backend Target | Step 36 Decision |
| --- | --- | --- | --- |
| Home / Today | active UI widgets and local/domain helpers | feature hooks per realm | deferred |
| Calendar | active calendar UI and reminder services | `src/features/calendarReminders` | deferred until generated types and route QA |
| Scan / AI | active AI import and assistant flows | `src/features/aiImport`, `src/features/ai` | partially wired; review-first persistence remains guarded |
| Health | active health hub and realm shortcuts | feature indexes by realm | deferred |
| Family / Circle | active circle/family UI and legacy storage | `src/features/familySharing`, `src/features/careProfiles` | deferred |
| Profile / Settings | active preferences/profile sync | `src/features/account` | partially wired via existing profile services; generated type gap remains |
| Records | active records screen/storage helpers | `src/features/records` | deferred, storage policy/type readiness required |
| Medication / Supplements | active medication/supplement screens | `src/features/medicationSafety` | deferred |
| Pregnancy | active pregnancy storage/UI | `src/features/lifeStageHealth` | deferred |
| Women's Health | active cycle/women's health storage/UI | `src/features/lifeStageHealth` | deferred |
| Baby / Child | active baby/child storage/UI | `src/features/lifeStageHealth`, `src/features/careProfiles` | deferred |
| Fitness | active fitness services and local/domain data | `src/features/fitnessNutrition` | deferred |
| Nutrition | active nutrition storage/services | `src/features/fitnessNutrition` | deferred |
| Trusted Content | active trusted content storage/components | `src/features/trustedContent` | deferred |
| Notifications / Reminders | active reminder/notification services | `src/features/calendarReminders` | deferred |

## Import Cleanup Decision

No broad route import rewrite was performed. The active UI still imports many legacy modules under `src/lib` and `src/services`. Updating them now would risk behavior changes without generated table types or live migration verification.

## Safe UI Behavior

Routes should continue showing existing loading, empty, or deferred states. They should not auto-create records on render or fill backend gaps with fake data.
