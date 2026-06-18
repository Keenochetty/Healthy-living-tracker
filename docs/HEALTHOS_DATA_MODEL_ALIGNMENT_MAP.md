# HealthOS Data Model Alignment Map

Date: 2026-06-17

## Canonical Decisions

| Topic | Current State | Canonical Direction | Status |
| --- | --- | --- | --- |
| Auth user vs app profile | Supabase auth user is paired with `profiles`; later migrations also add `users`. | Keep Supabase auth as account identity. Keep `profiles` as the active app profile until a future care-subject migration is designed. | Partial |
| App profile vs care subject | Profile rows currently mix account settings and the health subject being managed. | Introduce a later non-destructive `care_profiles` or equivalent subject model before any destructive split. | Decision needed |
| Self vs child | `children` exists separately; family members and profiles also represent people. | Child records should remain under `children` with parent/guardian ownership and explicit access. | Partial |
| Child vs baby | Baby/child UI should use the same `children` identity with age/stage-specific tables. | Keep route aliases; avoid separate baby identity table unless product requires it. | Partial |
| Family circle vs member | `families`, `family_members`, and `family_memberships` overlap. | Treat `family_memberships` as account-to-circle membership. Treat `family_members` as legacy/care-subject bridge until normalized. | Partial |
| Caregiver profile vs assignment | `caregiver_profiles` and `caregiver_child_access` exist. | Keep caregiver identity separate from child access assignments. | Aligned |
| Pregnancy profile vs baby | Pregnancy schema is missing. | Add `pregnancy_profiles` and logs first; baby/child profile creation after birth should be explicit. | Missing |
| Records vs files | Records are split across `health_records`, `documents`, `medical_records`, and `medical_documents`. | Add `record_files` and `record_links` to stop duplicating metadata and attach records to realm rows. | Missing |
| AI extraction job vs import envelope | App has `app_ai_imports`, `healthsync_ai_imports`, scan results, and legacy AI action tables. | Use review-first AI import envelopes. No AI result should write directly into health records. | Partial |
| Reminder vs notification | `reminders` and `notifications` exist, but source/history is incomplete. | `reminders` are user intent. `notifications` are delivery/inbox artifacts. Add source columns and history. | Partial |
| Trusted content vs saved content | Trusted content appears static/client-oriented from this audit. | Public reference content should be separate from user-private saved content. | Missing |
| Food vs nutrition | Food is the route label; nutrition is the data concept. | Use nutrition naming in schema. Keep food as route alias. | Missing |
| Cycle vs women's health | Cycle route stands in for women's health. | Use women's health/cycle-specific private tables. Keep route aliases. | Missing |

## Duplicate Or Legacy Models

- `profiles` and `users` both appear as account/profile concepts.
- `families`, `family_members`, and `family_memberships` overlap.
- `medical_records`, `medical_documents`, `documents`, and `health_records` overlap.
- Legacy AI tables `ai_chat_sessions`, `ai_messages`, and `ai_actions` overlap with owner-only app AI tables.
- `medicine_logs` is an older medication log model and should be evaluated before expanding medication history.

## Static Helper Source

The normalized static source of truth for app-side decisions is:

- `src/features/healthosDataModel/tableRegistry.ts`
- `src/features/healthosDataModel/realmDataContracts.ts`
- `src/features/healthosDataModel/modelAliases.ts`
- `src/features/healthosDataModel/backendReadiness.ts`
- `src/features/healthosDataModel/migrationBacklog.ts`

