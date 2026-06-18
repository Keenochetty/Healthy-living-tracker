# HealthOS MVP Release Blockers

Date: 2026-06-17

## Critical Blockers

| ID | Category | Blocker | Required Before MVP | Required Before Store | Status | Recommended Fix |
| --- | --- | --- | --- | --- | --- | --- |
| RB-002 | RLS | Sensitive table RLS incomplete or unknown | Yes | Yes | Open | Implement owner, guardian, explicit permission, and caregiver-scoped policies. |
| RB-003 | Storage | Records storage policy not canonical | Yes | Yes | Open | Add record file metadata and align storage policies. |
| RB-004 | Records | `record_files` and `record_links` missing | Yes | Yes | Planned | Create additive records metadata/link tables. |
| RB-005 | Family | Family permissions incomplete | Yes | Yes | Blocked | Finalize `sharing_permissions` shape and enforce it. |
| RB-007 | AI | AI import review persistence incomplete | Yes | Yes | Planned | Implement review-first import jobs/envelopes/events. |
| RB-013 | Schema | Persistent realm schemas missing | Yes | Yes | Open | Implement or explicitly keep affected screens as placeholders. |

## High-Risk Blockers

| ID | Category | Risk | Status | Fix |
| --- | --- | --- | --- | --- |
| RB-001 | Schema | Generated database types missing | Planned | Generate and wire types after migrations. |
| RB-008 | Notifications | Reminder source/history missing | Planned | Add source fields and `reminder_history`. |
| RB-009 | Privacy | Privacy/legal release copy needs final review | Open | Review health claims, AI safety, export/delete, and terms/privacy URLs. |
| RB-010 | Auth | Export/delete coverage not fully proven | Planned | Validate all tables and storage objects. |

## Medium / Low Risks

| ID | Category | Risk | Status |
| --- | --- | --- | --- |
| RB-006 | Child | Child age transition incomplete | Blocked |
| RB-011 | Notifications | Full push backend deferred | Deferred |
| RB-012 | Store | Subscription billing not implemented | Deferred |
| RB-014 | Performance | Backend QA sequence not executed | Planned |

## Source Docs

- `docs/HEALTHOS_RLS_POLICY_AUDIT.md`
- `docs/HEALTHOS_STORAGE_POLICY_AUDIT.md`
- `docs/HEALTHOS_SCHEMA_GAP_REPORT.md`
- `docs/HEALTHOS_MIGRATION_BACKLOG.md`
- `docs/HEALTHOS_DATABASE_TYPES_AUDIT.md`
- `docs/HEALTHOS_EXPORT_DELETE_READINESS.md`

