# HealthOS Style Sheet 05 - Calendar Refinement

This file is the local source of truth for the HealthOS Calendar refinement phase.

## Scope

- Refine only the active Calendar tab.
- Do not redesign Home, Scan, Health, Family, Fitness, Nutrition, Women's Health, Pregnancy, Medication, Records, or deep realm pages.
- Do not change Supabase, auth, storage, AI extraction, database migrations, seed data, or business flows.
- Use `src/theme/healthos`, `src/components/healthos`, and `src/components/healthos/shell`.

## Calendar Structure

The refined Calendar renders:

- HealthOS shell header
- Compact month header with actions
- Horizontal filter row
- Less-rounded month grid or selected-week strip
- Selected day summary
- Calendar legend
- Day timeline sheet
- Quick log sheet

The existing tab layout owns the floating bottom nav and global AI search overlay, so the Calendar screen must not duplicate those controls.

## Event Data

Use existing read-only data sources where available:

- Local reminders
- Fitness calendar reminders
- Women's health overlay data when existing privacy settings allow it

Do not invent fake calendar, medication, baby, family, or health events.

## Interaction Rules

- Tapping a day selects it.
- Long-pressing a day opens quick log.
- View full day opens the timeline sheet.
- Quick log routes to existing screens only and does not write data directly.
- Filters affect indicators and selected day summary.
- Collapse foundation can be a safe manual month/week toggle.

## Verification

Run typecheck only:

```bash
npm run typecheck
```
