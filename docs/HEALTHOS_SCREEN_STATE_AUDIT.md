# HealthOS Screen State Audit

Date: 2026-06-18

## Status By Screen Group

| Screen group | Loading | Empty | Error | Deferred | Permission required | Review required |
| --- | --- | --- | --- | --- | --- | --- |
| Home | Partial | Present | Partial | Present | N/A | N/A |
| Calendar | Present/partial | Present | Partial | Present | N/A | For AI-generated candidates |
| Scan | Present/partial | Present | Present | Present | Camera permission | Yes |
| AI | Present | Present | Present | Present | Auth/backend where needed | Yes |
| AI Import Review | Present | Present | Present | Present | Auth/backend where needed | Yes |
| Health | Partial | Present | Partial | Present | Per realm later | N/A |
| Family | Partial | Present | Partial | Present | Sharing permission model | N/A |
| Records | Partial | Present | Present | Present | Owner/permission model | Extraction review |
| Medication | Partial | Present | Partial | Present | Owner/permission model | Medication candidates |
| Supplements | Partial | Present | Partial | Present | Owner/permission model | Supplement candidates |
| Pregnancy | Present | Present | Present | Present | Private by default | AI/scan candidates |
| Women’s Health | Partial | Present | Partial | Present | Private by default | AI/scan candidates |
| Baby/Child | Partial | Present | Partial | Present | Guardian/caregiver model | AI/scan candidates |
| Fitness | Partial | Present | Partial | Present | N/A | Imported plans |
| Nutrition/Food | Partial | Present | Partial | Present | N/A | Scans/imports |
| Trusted Content | Partial | Present | Partial | Present | Saved history private | AI summaries |
| Notifications/Reminders | Partial | Present | Partial | Present | Push permission | Reminder candidates |
| Profile/Settings | Partial | Present | Present | Present | Auth required | N/A |
| Onboarding/Auth | Present/partial | N/A | Present | N/A | N/A | N/A |

## Fixes In This Step

- General Health fake ready state changed to empty.
- AI extraction backend failure changed to failed/deferred state.
- Device Sync mock source removed from available source list.

## Remaining Work

- Device/simulator QA is required to validate visual state coverage and tap-through behavior.
- Full backend-connected loading/error states depend on generated Supabase types and applied migrations.

