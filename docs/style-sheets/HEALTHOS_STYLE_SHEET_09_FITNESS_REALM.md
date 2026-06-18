# HealthOS Style Sheet 09 - Fitness Realm

## Purpose

This style sheet defines the HealthOS Fitness realm.

Fitness is the first deep realm redesign. It should feel clean, premium, practical, and motivating: dark athletic cards, compact week strip, segmented circular progress ring, progress legend, daily workout cards, streaks, useful stats, and a calm premium mobile layout.

## Scope

This phase includes:

- Fitness realm screen redesign
- Week strip
- Today workout hero
- Segmented progress ring foundation
- Progress legend
- Streak/stat cards
- Daily plan cards
- Long-press workout/card options
- Exercise list foundation
- Muscle map foundation
- Exercise detail pull-up sheet
- Calendar connection foundation
- Family sharing foundation
- Scan-to-gym-machine connection foundation
- Empty/loading/error states
- Safe routing to existing fitness flows

## Rules

- Do not redesign Nutrition, Women’s Health, Pregnancy, Medication, Records, Baby/Child, Calendar, Health Hub, Home, Scan, or Family.
- Do not add Fitness to the visible bottom nav.
- Do not fake progress values, personal bests, calories, videos, or completed workouts.
- Do not implement machine recognition, auto-sharing, or native calendar writes in this phase.
- Do not install packages.
- Do not run full build.

## Verification

Run only:

```bash
npm run typecheck
```

