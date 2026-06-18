# HealthOS Style Sheet 07 - Health Hub Modular Dashboard

## Purpose

This style sheet defines the HealthOS Health Hub.

The Health tab is the main gateway into the user's health realms. It should feel like a premium, modular health control center where users can quickly see what matters, reorder sections, enter deeper realms, and learn from trusted content related to their goals.

This phase includes:

- Health tab modular dashboard
- Reorderable/visibility foundation for health sections
- Long-press section menu
- Section information mode
- Realm entry cards
- Vitals summary
- Medication and supplements summary
- Fitness and nutrition summary
- Women's health, pregnancy, and baby-child entry logic
- Records accordion
- Trusted content/news/article card foundation
- Empty/loading/error states
- Route-safe actions

This phase must not redesign Fitness, Nutrition, Women's Health, Pregnancy, Medication, Records, Baby/Child, Supplements, or deep realm pages. It only creates the Health Hub entry layer.

## Product Goal

The Health Hub must answer:

1. What health areas are active for me?
2. What needs attention?
3. Where do I go to manage a specific realm?
4. What can I learn that is relevant to my plan, diet, medication, pregnancy, child care, or fitness goal?
5. How can I customize what I see first?

## Screen Structure

```txt
HealthOSAppShell
  Scrollable Health content
    Health hero summary
    Quick health actions
    Modular section area
      Vitals Overview
      Medication & Supplements
      Fitness & Nutrition
      Women's Health / Cycle
      Pregnancy
      Baby / Child
      Records Accordion
      Trusted Content / News
      Device Sync
```

The global shell provides top header, AI command bar, and floating bottom nav. The Health screen must not duplicate those global elements.

## Rules

- Use HealthOS design system primitives.
- Use existing data only when safe.
- Use empty states when data is not wired.
- Do not fake health, medication, pregnancy, baby, child, fitness, nutrition, or article values.
- Do not scrape the web.
- Do not create backend tables for Health section preferences.
- Do not install packages.
- Do not run full build.

## Verification

Run only:

```bash
npm run typecheck
```

