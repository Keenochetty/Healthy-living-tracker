# HealthOS Women's Health Privacy Audit

Date: 2026-06-18

## Result

Women's health, contraception, and sex-day tables have local RLS enable statements. Sex-day data must remain private by default and must not appear in shared family or shared calendar contexts.

## Confirmed

- `women_health_logs`, `contraception_logs`, and `sex_day_logs` have local RLS enable statements.
- Step 37 route audit did not add shared exposure.
- Calendar overlay code uses private/shared labels but should not expose sex-day detail in shared contexts.

## Deferred Tests

- Family member without permission cannot query women's health logs.
- Family member cannot query sex-day logs even with broad family membership.
- Shared calendar indicators do not reveal private details.
- Pregnancy is private unless explicitly shared.

## Risk

Low to medium. SQL appears private by default, but shared UI overlays need staging actor tests.
