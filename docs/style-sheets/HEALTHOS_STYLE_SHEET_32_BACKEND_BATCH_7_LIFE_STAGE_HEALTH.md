# HealthOS Style Sheet 32 - Backend Batch 7: Life-Stage Health

This local source sheet covers Backend Batch 7 for pregnancy, women's health, and baby/child foundations.

Scope is limited to private metadata tables, owner-only RLS drafts, domain types, privacy helpers, safety copy, service methods, hooks, and documentation. It excludes UI redesign, diagnosis, fertility probability claims, pregnancy risk scoring, growth percentiles, vaccine recommendations, child dose calculation, AI medical interpretation, push notification backend, fake seed data, remote Supabase commands, and package installation.

Default privacy:
- Pregnancy: private.
- Women's health: private.
- Sex-day logs: private and never shared by default.
- Baby/child data: parent or guardian managed.
- Caregiver notes: limited access only.
- Vaccine, growth, milestone records: private unless explicitly shared later.

Verification is limited to `npm run typecheck`.
