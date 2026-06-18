# HealthOS Schema Gap Report

Date: 2026-06-17

## Major Gaps

| Area | Gap | Impact | Recommended Handling |
| --- | --- | --- | --- |
| Generated database types | No generated `database.types.ts` was found. Only handwritten `src/types/database.ts` exists. | Supabase row typing is incomplete and can drift from migrations. | Generate typed Supabase schema after the project is linked and schema is stable. |
| Records | `record_files` and `record_links` are missing. | Files and realm-linked records remain split across legacy models. | Add additive tables before records MVP release. |
| Storage | Private health bucket set is not canonical. | Upload/download behavior and policy review remain fragmented. | Define bucket map and storage policies before release. |
| Reminders | Source columns and `reminder_history` are missing. | Calendar, medication, supplements, and AI imports cannot reliably trace reminder origin. | Add nullable source columns and a history table. |
| Nutrition/Food | `nutrition_logs`, `meals`, recipes, and grocery/shopping tables are missing. | Food UI cannot persist canonical nutrition data. | Use nutrition naming; keep food as route alias. |
| Fitness content | Services reference `fitness_exercises`, `fitness_workout_programs`, `fitness_workout_program_days`, `fitness_goal_progressions`, and `fitness_nutrition_templates`, but migrations were not found. | Runtime queries can fail when those screens hit live Supabase. | Add public/auth-readable reference tables or adjust services. |
| Pregnancy | Pregnancy profile/log/checklist tables are missing. | Pregnancy UI cannot persist canonical data. | Add additive pregnancy tables. |
| Women's health/cycle | Cycle and symptom tables are missing. | Private cycle data lacks canonical persistence. | Add private cycle realm tables with strict RLS. |
| Supplements | Supplement tables are missing. | Supplements risk being forced into medication tables. | Add supplement schedule/log tables. |
| Trusted content | `trusted_content`, `content_sources`, and `saved_content` are missing. | Articles/trusted content cannot separate public reference data from saved user data. | Add public reference and user-private saved tables. |
| Family permissions | `sharing_permissions` shape is not fully canonical. | Sensitive medical sharing may rely on broad family membership. | Finalize permission shape before tightening RLS. |
| Child age transfer | No automated age/ownership transition exists. | Legal/product risk around child data ownership at age thresholds. | Defer to product/legal decision; document as post-MVP blocker if required. |

## Backend Readiness By Realm

- Ready: Auth.
- Partial: Home, Calendar, Scan, Health, Family, AI, Fitness, Medication, Baby/Child, Caregiver, Profile, Settings, Onboarding, Notifications, Reminders.
- Schema missing: Nutrition/Food, Supplements, Pregnancy, Women's Health/Cycle, Trusted Content.
- Storage missing: Records.
- UI only: Elder, Device Sync, Biometrics.

## Migration Drafts

No Phase 24 migration draft was created. The safest output for this pass is a reviewed backlog because several gaps require naming and ownership decisions before schema is added.

## Type Risk

`src/types/database.ts` is handwritten and only covers profile settings/module/widget rows. It does not represent the full migration set.

