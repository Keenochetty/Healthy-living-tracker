# HealthOS Style Sheet 08 - Family / Circle

## Purpose

This style sheet defines the HealthOS Family / Circle tab.

The Family tab is the relationship, sharing, and care coordination hub. It must show who is connected, what they have shared, shared events, moods/updates, profile details, individual notifications, and permission-aware care access.

This phase includes:

- Family / Circle tab visual structure
- Premium circle top block
- Member avatars and relationship layout
- Shared mood/update overview
- Shared events preview
- Member profile detail sheet
- Individual notification settings foundation
- Member long-press quick actions
- Family invite / manage foundation
- Caregiver card foundation
- Permission-aware shared data display
- Empty/loading/error states

## Rules

- Use the HealthOS design system.
- Do not create fake family members, moods, events, joined dates, caregivers, rates, or permissions.
- Show only data that existing storage and permissions expose.
- Use empty states when sharing or permission data is missing.
- Do not build destructive member removal in this phase.
- Do not build a full invite backend in this phase.
- Do not install packages.
- Do not run a full build.

## Verification

Run only:

```bash
npm run typecheck
```

