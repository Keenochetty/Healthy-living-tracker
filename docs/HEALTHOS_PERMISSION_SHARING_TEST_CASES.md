# HealthOS Permission Sharing Test Cases

Date: 2026-06-18

No tests were run. These are documentation-only cases for future local/staging RLS verification.

| Test ID | Area | Scenario | Actor | Expected Access | Expected Denial | Tables Involved | UI Involved | Status | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| PERM-001 | Family | Owner opens own circle | owner | circle/member metadata | none | `family_circles`, `family_circle_members` | Family tab | not run | Owner should manage own circle. |
| PERM-002 | Records | Family member without permission opens record | family member without permission | none | record metadata and files | `records`, `record_files`, `sharing_permissions` | Records, Family member sheet | not run | Family membership alone must fail. |
| PERM-003 | Records | Family member with `view_records_shared` opens shared record summary | family member with permission | permitted record summary/file access only | unrelated records | `records`, `record_files`, `sharing_permissions` | Records shared view | not run | Permission key must be active and unexpired. |
| PERM-004 | Medication | Circle admin attempts medication details without permission | circle admin | circle admin metadata only | medication details/logs | `medications`, `medication_logs`, `sharing_permissions` | Family, Medication | not run | Admin role is not medical access. |
| PERM-005 | Caregiver | Caregiver without assignment opens child logs | caregiver without assignment | none | child logs | `caregiver_assignments`, child log tables | Baby/Child | not run | Must deny. |
| PERM-006 | Caregiver | Caregiver with limited assignment opens allowed note area | caregiver with limited assignment | assigned limited area only | all other child health details | `caregiver_assignments`, `caregiver_notes` | Caregiver cards | not run | Assignment scope must be enforced. |
| PERM-007 | Child | Guardian opens child profile | child guardian | child profile/logs they own or guard | unrelated child profiles | `care_profiles`, child log tables | Baby/Child | not run | Guardian model requires explicit relationship. |
| PERM-008 | Women Health | Family member attempts sex-day logs | family member with permission | none by default | all sex-day logs | `sex_day_logs` | Family, Calendar | not run | Sex-day logs must stay strictly private. |
| PERM-009 | AI Import | Different user opens AI import envelope | unrelated authenticated user | none | envelope/evidence/review events | `ai_import_envelopes`, `ai_source_evidence`, `ai_review_events` | AI import review | not run | Owner-only candidate data. |
| PERM-010 | Unauth | Unauthenticated user reads private table | unauthenticated user | none | all private rows | all sensitive tables | all private screens | not run | Should require auth. |
