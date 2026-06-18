# HealthOS Style Sheet 10 - Nutrition Realm

## Purpose

This sheet defines the HealthOS Nutrition realm. Nutrition is the food companion to Fitness: compact, visual, practical, family-aware, AI-assisted, and connected to health goals.

## Scope

- Nutrition realm screen redesign only.
- Reuse HealthOS tokens, shell, primitives, and shared chart components.
- Reuse `HealthOSSegmentedRingChart`.
- Do not add Nutrition/Food to the visible bottom nav.
- Do not fake meals, calories, macros, water, warnings, allergies, or article links.
- Do not auto-save AI scan/import output, auto-share meal plans, or auto-add meals to calendar.
- Do not redesign other realms in this phase.

## Required Structure

```txt
HealthOSAppShell
  Nutrition content
    Nutrition header / goal summary
    Daily nutrition hero
      Segmented macro ring
      Macro legend
    Quick actions
    Meal timeline
    Meal plan cards
    Scan/import card
    Grocery/shopping list foundation
    Diet goals / preferences
    Nutrition cautions
    Recipes/articles preview
    Calendar/family sharing card
```

## Data Rules

Use existing local nutrition data where safe:

- diary entries
- daily nutrition summary
- active nutrition target
- water goal/logs
- saved meals
- recipes
- trusted health content

If data is missing, render empty states only.

## Safety

Nutrition cautions are guidance only. The app must not diagnose, tell users to stop medication, claim foods cure symptoms, or replace professional advice.
