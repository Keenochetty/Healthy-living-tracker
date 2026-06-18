# HealthOS Life-Stage RLS

Date: 2026-06-17

## Policy Draft

The Batch 7 migration enables RLS on all new life-stage tables and adds conservative owner policies:

- owners can select own rows
- owners can insert own rows
- owners can update own rows

Policies use `TO authenticated` plus `(select auth.uid()) = owner_user_id`.

## Family Membership Is Not Permission

Family circle membership is relationship context only. It must not grant pregnancy, women's health, sex-day, child medical, vaccine, growth, or milestone access by itself.

## Pregnancy

Pregnancy rows are owner-only by default. Care team contacts are contact-only metadata and do not create account access.

## Women's Health

Women's health and contraception rows are owner-only by default. Sex-day logs are strictly private and must not appear in shared/family/caregiver contexts.

## Baby / Child

Child rows are guardian/owner managed. Caregiver full read access is deferred. `caregiver_notes` exists as a limited note foundation but broad caregiver reads are not granted.

## Deferred

Explicit family/caregiver policies can be added later only after permission keys are finalized.
