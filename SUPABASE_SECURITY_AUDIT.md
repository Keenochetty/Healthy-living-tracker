# Supabase Security Audit

Prepared for production hardening review. This is a source-controlled audit checklist, not proof that the live Supabase project is configured correctly.

Sources checked:

- Supabase RLS docs: https://supabase.com/docs/guides/database/postgres/row-level-security
- Supabase Storage access control: https://supabase.com/docs/guides/storage/security/access-control
- Supabase backups: https://supabase.com/docs/guides/platform/backups
- Supabase service-role/RLS note: https://supabase.com/docs/guides/troubleshooting/why-is-my-service-role-key-client-getting-rls-errors-or-not-returning-data-7_1K9z

## Audit Legend

- Health: contains health or wellness data.
- Child: contains child/dependent data.
- Repro: contains reproductive, sexual, contraception, pregnancy, or cycle data.
- Docs: contains files/documents or file metadata.
- AI: contains assistant data.
- Family: contains family, sharing, caregiver, or permissions data.
- RLS: must be enabled in production.
- Policies: must enforce owner/profile/permission rules.
- Indexes: must cover policy and query columns.
- Audit: sensitive access/change should be logged.
- Export/Delete: should be included in privacy flows.

| Table                         | Health | Child | Repro | Docs | AI  | Family | RLS      | Policies | Indexes  | Audit    | Export/Delete  |
| ----------------------------- | ------ | ----- | ----- | ---- | --- | ------ | -------- | -------- | -------- | -------- | -------------- |
| health_profiles               | yes    | yes   | yes   | no   | no  | yes    | required | required | required | yes      | yes            |
| family_circles                | no     | no    | no    | no   | no  | yes    | required | required | required | yes      | yes            |
| family_circle_members         | no     | yes   | no    | no   | no  | yes    | required | required | required | yes      | yes            |
| profile_permissions           | yes    | yes   | yes   | no   | no  | yes    | required | required | required | yes      | yes            |
| caregiver_profiles            | yes    | yes   | no    | no   | no  | yes    | required | required | required | yes      | yes            |
| emergency_info_cards          | yes    | yes   | no    | no   | no  | yes    | required | required | required | yes      | yes            |
| health_quick_widgets          | yes    | yes   | yes   | no   | no  | yes    | required | required | required | no       | yes            |
| nutrition_diary_entries       | yes    | no    | no    | no   | no  | no     | required | required | required | no       | yes            |
| custom_foods                  | yes    | no    | no    | no   | no  | no     | required | required | required | no       | yes            |
| saved_meals                   | yes    | no    | no    | no   | no  | no     | required | required | required | no       | yes            |
| recipes                       | yes    | no    | no    | no   | no  | no     | required | required | required | no       | yes            |
| workout_sessions              | yes    | no    | no    | no   | no  | no     | required | required | required | no       | yes            |
| workout_sets                  | yes    | no    | no    | no   | no  | no     | required | required | required | no       | yes            |
| personal_records              | yes    | no    | no    | no   | no  | no     | required | required | required | no       | yes            |
| biometric_logs                | yes    | yes   | no    | no   | no  | no     | required | required | required | yes      | yes            |
| medications                   | yes    | yes   | no    | no   | no  | no     | required | required | required | yes      | yes            |
| supplements                   | yes    | yes   | no    | no   | no  | no     | required | required | required | yes      | yes            |
| health_schedules              | yes    | yes   | no    | no   | no  | no     | required | required | required | yes      | yes            |
| dose_logs                     | yes    | yes   | no    | no   | no  | no     | required | required | required | yes      | yes            |
| medication_standard_matches   | yes    | no    | no    | no   | no  | no     | required | required | required | yes      | yes            |
| supplement_ingredient_matches | yes    | no    | no    | no   | no  | no     | required | required | required | yes      | yes            |
| safety_notices                | yes    | yes   | yes   | no   | no  | no     | required | required | required | yes      | yes            |
| health_records                | yes    | yes   | no    | yes  | no  | no     | required | required | required | yes      | yes            |
| doctor_visits                 | yes    | yes   | no    | yes  | no  | no     | required | required | required | yes      | yes            |
| vaccine_records               | yes    | yes   | no    | yes  | no  | no     | required | required | required | yes      | yes            |
| lab_result_records            | yes    | no    | no    | yes  | no  | no     | required | required | required | yes      | yes            |
| prescription_records          | yes    | no    | no    | yes  | no  | no     | required | required | required | yes      | yes            |
| health_reminders              | yes    | yes   | yes   | no   | no  | yes    | required | required | required | yes      | yes            |
| health_timeline_events        | yes    | yes   | yes   | no   | no  | yes    | required | required | required | yes      | yes            |
| womens_health_settings        | yes    | no    | yes   | no   | no  | no     | required | required | required | yes      | yes            |
| cycle_profiles                | yes    | no    | yes   | no   | no  | no     | required | required | required | yes      | yes            |
| period_logs                   | yes    | no    | yes   | no   | no  | no     | required | required | required | yes      | yes            |
| womens_symptom_logs           | yes    | no    | yes   | no   | no  | no     | required | required | required | yes      | yes            |
| mood_energy_logs              | yes    | no    | yes   | no   | no  | no     | required | required | required | yes      | yes            |
| contraception_methods         | yes    | no    | yes   | no   | no  | no     | required | required | required | yes      | yes            |
| contraception_logs            | yes    | no    | yes   | no   | no  | no     | required | required | required | yes      | yes            |
| pregnancy_profiles            | yes    | no    | yes   | no   | no  | no     | required | required | required | yes      | yes            |
| pregnancy_appointments        | yes    | no    | yes   | yes  | no  | no     | required | required | required | yes      | yes            |
| pregnancy_symptom_logs        | yes    | no    | yes   | no   | no  | no     | required | required | required | yes      | yes            |
| baby_child_profiles           | yes    | yes   | no    | yes  | no  | yes    | required | required | required | yes      | yes            |
| baby_feeding_logs             | yes    | yes   | no    | no   | no  | yes    | required | required | required | no       | yes            |
| baby_sleep_logs               | yes    | yes   | no    | no   | no  | yes    | required | required | required | no       | yes            |
| baby_diaper_logs              | yes    | yes   | no    | no   | no  | yes    | required | required | required | no       | yes            |
| baby_growth_logs              | yes    | yes   | no    | no   | no  | yes    | required | required | required | yes      | yes            |
| baby_milestone_logs           | yes    | yes   | no    | no   | no  | yes    | required | required | required | yes      | yes            |
| baby_solid_food_logs          | yes    | yes   | no    | no   | no  | yes    | required | required | required | yes      | yes            |
| baby_vaccine_records          | yes    | yes   | no    | yes  | no  | yes    | required | required | required | yes      | yes            |
| mens_health_settings          | yes    | no    | yes   | no   | no  | no     | required | required | required | yes      | yes            |
| mens_health_check_ins         | yes    | no    | yes   | no   | no  | no     | required | required | required | yes      | yes            |
| mens_health_symptom_logs      | yes    | no    | yes   | no   | no  | no     | required | required | required | yes      | yes            |
| assistant_settings            | yes    | yes   | yes   | no   | yes | yes    | required | required | required | yes      | yes            |
| assistant_messages            | yes    | yes   | yes   | no   | yes | yes    | required | required | required | yes      | yes            |
| assistant_drafts              | yes    | yes   | yes   | no   | yes | yes    | required | required | required | yes      | yes            |
| assistant_audit_logs          | yes    | yes   | yes   | no   | yes | yes    | required | required | required | yes      | yes            |
| consent_records               | yes    | yes   | yes   | no   | no  | yes    | required | required | required | yes      | yes            |
| privacy_audit_logs            | yes    | yes   | yes   | yes  | yes | yes    | required | required | required | retained | export-limited |
| synced_health_samples         | yes    | no    | no    | no   | no  | no     | required | required | required | yes      | yes            |
| health_sync_connections       | yes    | no    | no    | no   | no  | no     | required | required | required | yes      | yes            |

## Risks Found

- Current app code is local-first and many tables are documentation-only; live Supabase schema must be compared before release.
- `src/lib/supabase.ts` uses only `EXPO_PUBLIC_SUPABASE_URL` plus publishable/anon key. No service-role key was found in `src` code by static search.
- `.env.example` previously listed server-style keys in the same file as Expo public keys; Phase 24 separates server-only examples into `.env.local.example`.
