# HealthOS Release Risk Register

| ID | Severity | Area | Risk | Release blocker | Suggested fix | Status | Reference |
| --- | --- | --- | --- | --- | --- | --- | --- |
| RISK-001 | Critical blocker | Legal | Privacy policy and terms are not final. | Yes | Write and review final legal policies. | Not started | `docs/HEALTHOS_PRIVACY_LEGAL_READINESS.md` |
| RISK-002 | Critical blocker | Account deletion | Deletion flow needs end-to-end QA. | Yes | Verify deletion and data cleanup in development/release build. | Needs review | `supabase/functions/delete-account` |
| RISK-003 | High | Notifications | Expo Go cannot validate production-like notification behavior. | Yes | Test notifications in development builds. | Documented | `src/services/reminders/notificationService.ts` |
| RISK-004 | High | AI | AI backend must stay server-side and review-first. | Yes | Verify no client keys and no direct-save imports. | Needs review | `supabase/functions/ai-chat` |
| RISK-005 | High | Records | Secure file upload/viewer flow is not final. | Yes | Finalize private storage, signed URLs, viewer fallback. | Needs fix | `src/components/healthos/records` |
| RISK-006 | Medium | Performance | Growing lists still use ScrollView/map in some active screens. | No | Virtualize large data lists before production scale. | Documented | AI, Records, Reminders, Trusted Content |
| RISK-007 | Critical blocker | Store assets | Store assets and reviewer access plan are missing. | Yes | Prepare assets, store copy, screenshots, demo account plan. | Not started | Store docs |
| RISK-008 | High | Subscriptions | Subscription UI exists but billing is not implemented. | Yes if paid exposed | Keep placeholder or implement platform billing. | Documented | `src/app/settings/subscription.tsx` |
| RISK-009 | Medium | Permissions | Denied/unavailable permission states need device QA. | No | Test camera/photos/notifications/biometrics denied states. | Documented | app config, settings |
| RISK-010 | High | Health claims | Health copy needs professional review. | Yes | Review medication, pregnancy, child, AI, fitness, nutrition copy. | Documented | `src` |
