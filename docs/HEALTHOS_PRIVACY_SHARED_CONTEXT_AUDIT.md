# HealthOS Privacy Shared Context Audit

Date: 2026-06-18

## Summary

No Step 38 change expanded shared-context access. Family membership remains separate from medical access.

## Shared Context Findings

| Context | Result | Risk |
| --- | --- | --- |
| Home widgets | Empty/deferred state copy is privacy-safe; private reminder titles are masked in Home timeline builder. | low |
| Health Hub cards | Metadata cards do not expose private row details by default. | low |
| Family tab | Uses permission labels and shared module summaries; no full medical records are shown by membership alone. | medium pending actor tests |
| Family member detail sheet | Must continue to show only permission summaries, not medical detail. | medium |
| Caregiver cards | Limited display data; caregiver access must be tested with assignment scope. | medium |
| Calendar overlays | Private/shared indicators exist; sex-day detail must remain excluded from shared context. | medium |
| Records cards | Raw storage paths are hidden in HealthOS record detail UI. | low |
| Medication cards | No broad shared exposure added. | low |
| Pregnancy cards | Private by default; no shared expansion added. | low |
| Women's Health cards | Private by default; sex-day logs remain sensitive. | low |
| Baby/Child cards | No broad shared expansion added; guardian/caregiver tests needed. | medium |
| AI import cards | Evidence is shown without exposing storage paths. | low |
| Trusted Content saved/read history | Must remain owner-private; RLS exists for saved/read tables. | low |

## Conclusion

Shared UI is acceptable for current local state, with medium-risk actor tests still needed for family, caregiver, calendar overlays, and child contexts.
