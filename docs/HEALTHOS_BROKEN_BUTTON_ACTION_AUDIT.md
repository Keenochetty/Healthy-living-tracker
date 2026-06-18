# HealthOS Broken Button + Action Audit

Date: 2026-06-18

## High-Priority Action Status

| Action | Status | Notes |
| --- | --- | --- |
| Bottom nav tabs | Opens existing route | Five-item contract is defined in `healthOSNavConfig.ts`. |
| Top profile/settings entry | Opens existing route or sheet | Settings/profile control panel uses existing route rows and deferred copy. |
| Notification/reminder actions | Shows deferred or local state | Push registration remains deferred. |
| AI search / command bar | Opens AI shell or backend-backed flow | Backend failures are surfaced instead of fake results. |
| Scan capture | Shows placeholder/review state | No direct final save added. |
| Home widgets | Mostly open existing routes or show deferred state | Fake family and health values removed where found. |
| Health Hub cards | Opens existing route or placeholder screen | Deep realms are not bottom nav items. |
| Family member cards | Opens existing family/circle route when data exists | Default fake invitees removed. |
| Records upload/import | Deferred/safe service path | Secure viewer remains deferred. |
| Medication / supplement review | Review-first or deferred | No auto-schedule added. |
| Pregnancy / women / baby quick logs | Local/manual UI or deferred | No fake generated values added. |
| Fitness / nutrition AI import | Review-first or empty | Fallback plan generation removed. |
| Trusted content save/open | Local/deferred | Persistence remains documented as deferred. |
| Settings rows | Opens existing settings routes or deferred notices | No silent destructive action connected. |
| Sign out | Existing auth flow | No change in this step. |

## Fixed

- `src/components/ai/AiDraftReviewCard.tsx`: disabled the edit-later placeholder button instead of leaving it as a pressable no-op.
- `src/components/ai/AiCreateJobCard.tsx`: backend failure no longer routes to fake draft review.

## Remaining Unknowns

- Full tap-through verification requires a device/simulator pass. This step did not run Browser, Expo export, or a dev build by instruction.

