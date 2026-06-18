# HealthOS Migration Backlog

Date: 2026-06-17

## Before MVP

| ID | Area | Work | Type | Release Blocker | Notes |
| --- | --- | --- | --- | --- | --- |
| MVP-001 | Records | Create `record_files` | Create table | Yes | Normalize private file metadata without moving existing data. |
| MVP-002 | Records | Create `record_links` | Create table | Yes | Link records to realm rows without duplicating records. |
| MVP-003 | Reminders | Add reminder source columns | Add columns | Yes | Nullable `source_realm`, `source_table`, `source_row_id`. |
| MVP-004 | Reminders | Create `reminder_history` | Create table | No | Needed for notification/reminder audit. |
| MVP-005 | Nutrition | Create nutrition logs and meals | Create tables | Yes | Use nutrition naming, not food naming. |
| MVP-006 | Pregnancy | Create pregnancy profile/log/checklist tables | Create tables | Yes | Start small and additive. |
| MVP-007 | Women's Health | Create cycle realm tables | Create tables | Yes | Private cycle/symptom/contraception/sex-day data. |
| MVP-008 | Supplements | Create supplement schedule/log tables | Create tables | No | Do not force all supplement behavior into medication tables. |
| MVP-009 | Trusted Content | Create trusted content/source/saved tables | Create tables | No | Public reference plus user-private saved content. |
| MVP-010 | Fitness | Create missing fitness reference tables | Create tables | Yes | Required by active fitness content service references. |
| MVP-011 | Storage | Canonicalize private health buckets | Storage policy | Yes | Bucket map and policies before upload release. |
| MVP-012 | Family/RLS | Tighten family medical RLS | RLS policy | Yes | Use explicit sharing permissions for sensitive records. |
| MVP-013 | Family/RLS | Finalize `sharing_permissions` shape | Manual decision | Yes | Required before broad medical RLS tightening. |

## Post-MVP Or Decision-Heavy

| ID | Area | Work | Type | Reason |
| --- | --- | --- | --- | --- |
| POST-001 | Child | Automated child age transfer | Manual decision | Product/legal decision required. |
| POST-002 | Profile | Normalize profiles into care profiles | Destructive/manual decision | Needs migration, backfill, and compatibility plan. |
| POST-003 | Device Sync | Advanced device sync persistence | Create table | Defer until real integrations are production-ready. |

## Source Registry

The same backlog is represented in `src/features/healthosDataModel/migrationBacklog.ts` for app-side static inspection.

