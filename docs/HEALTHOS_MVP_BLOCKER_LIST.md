# HealthOS MVP Blocker List

Date: 2026-06-18

| ID | Severity | Area | File / Route | Issue | User impact | Privacy / safety impact | Recommended fix | Safe to fix now | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| MVP-001 | blocker | Backend types | `src/types/database.ts` | Generated Supabase table types are missing. | Live route wiring remains fragile/deferred. | Prevents reliable policy-aware service wiring. | Apply migrations in local/staging and regenerate types. | No | Open |
| MVP-002 | blocker | RLS/storage | Supabase project | SQL actor tests have not been run. | Permission model is unverified. | Private data isolation is not proven. | Run Step 38 SQL tests with synthetic users. | No | Open |
| MVP-003 | high | Private storage | Storage buckets | Several helper-referenced private buckets lack confirmed policies. | Upload/viewer flows may fail or be unsafe. | Sensitive file access risk. | Create/verify bucket policies before connecting writes. | No | Open |
| MVP-004 | high | Device QA | App-wide | No simulator/device tap-through pass completed in this step. | Broken actions/layout may remain. | Could expose wrong preview/copy in context. | Run development build QA after typecheck. | No | Open |
| MVP-005 | high | General health | `src/lib/generalHealthMockData.ts` | Active fake vitals existed. | Users could mistake demo values for real data. | Misleading health display. | Replaced with empty/deferred exports. | Yes | Fixed |
| MVP-006 | high | AI import | `src/components/ai/AiCreateJobCard.tsx` | Backend failure created mock draft. | Users could review fake extracted data. | Unsafe fake AI output. | Fail honestly with no draft. | Yes | Fixed |
| MVP-007 | high | Fitness AI import | `src/services/fitnessAiImportService.ts` | Backend absence returned fallback plan. | Users could mistake template for sourced plan. | Unsafe plan guidance risk. | Return empty results without backend. | Yes | Fixed |
| MVP-008 | medium | Family/Circle | `src/lib/circleStorage.ts` | Default fake invitees existed. | Fake family/caregiver data appeared. | Shared-context confusion. | Default to owner-only circle. | Yes | Fixed |
| MVP-009 | medium | AI review action | `src/components/ai/AiDraftReviewCard.tsx` | Edit placeholder was pressable with no action. | Silent no-op. | Low. | Disabled with explanatory copy. | Yes | Fixed |
| MVP-010 | medium | Route naming | `src/app/calendar`, `womens-health`, `nutrition`, `family`, `notifications` | Some requested route names are missing/renamed. | QA scripts may target wrong paths. | Low unless links point to missing paths. | Keep documented aliases or add deferred routes only if active links break. | Later | Open |

