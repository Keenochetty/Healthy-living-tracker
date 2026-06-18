# HealthOS Style Sheet 04 - Home / Today Modular Dashboard

This file is the local source of truth for the Home / Today modular dashboard phase.

## Scope

- Redesign only the active Home / Today tab.
- Keep Calendar, Scan, Health, Family, Fitness, Nutrition, Women's Health, Pregnancy, Medication, Records, and deep realm pages unchanged.
- Do not change Supabase, auth, storage, AI extraction, database migrations, seed data, or business flows.
- Use `src/theme/healthos`, `src/components/healthos`, and `src/components/healthos/shell`.

## Required Home Structure

`HealthOSAppShell` wraps the Home content. The Home content is scrollable and renders:

- Compact greeting / date hero
- One primary attention card
- Horizontal quick action row
- Modular widget stack

The existing tab layout still owns the floating bottom nav and legacy global AI bar, so Home must not duplicate those controls.

## Default Widgets

- Today Timeline
- Health Snapshot
- Medication Due
- Fitness / Nutrition
- Family Pulse
- AI Suggestion
- Upcoming Events
- Records Shortcut

## Widget Behavior

- Long press opens `HealthOSGlassMenu`.
- Menu actions: Information, Manage widget, Remove from Home.
- Information mode shows title, description, and tips.
- Remove from Home hides the widget for the current session.
- Manage widget is a placeholder info state for the future manager.
- Drag and drop reorder is not part of this phase.

## Data Rules

- Use safe empty states when real data is not wired.
- Do not invent fake health, medication, calendar, or family data.
- Do not create new backend tables or persistence.

## Verification

Run typecheck only:

```bash
npm run typecheck
```
