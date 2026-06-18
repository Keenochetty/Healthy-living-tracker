# HealthOS MVP Backend Scope

Date: 2026-06-17

## In Scope For MVP

- Auth and profile creation.
- Profile settings, module preferences, and widget preferences.
- Family circles and invitations with explicit permission tightening before sensitive sharing release.
- Calendar events and event responses.
- Reminders with normalized source fields.
- Records with private storage, `record_files`, and `record_links`.
- Review-first AI import flow for fitness, medication, nutrition, calendar, records, baby/child, cycle, and pregnancy.
- Fitness imported plans, plan days, plan calendar events, history, and muscle load history.
- Medication records, medication lookup, and reminder hooks.
- Child/caregiver core access tables.
- Account data export/delete edge functions.

## Must Be Resolved Before MVP Release

- Generated Supabase database types.
- Canonical storage bucket and storage policy map.
- Missing records tables.
- Missing reminder source/history model.
- Missing fitness reference tables used by active services.
- Missing nutrition, pregnancy, cycle, and supplement schemas if those realms remain visible as persistent features.
- Family medical RLS must not rely only on broad family membership.

## Deferred From MVP

- Destructive profile/care-subject split.
- Automated child age transfer.
- Full device sync persistence.
- Elder-specific persistence.
- Advanced trusted content editorial workflow.
- Full analytics/reporting warehouse.

