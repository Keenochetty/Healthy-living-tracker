# HealthOS Style Sheet 01 - Design Foundation

## Purpose

This style sheet defines the first clean visual foundation for HealthOS after the styling reset. It does not redesign app pages yet. It creates the reusable design language every future page must use.

HealthOS is a premium modular family health app. It must feel calm, intelligent, smooth, glassy, compact, and trustworthy. It combines personal health, family care, AI scan/search, calendar, fitness, nutrition, medication, pregnancy, women’s health, baby/child care, records, and caregiver support.

The app must not feel like a cluttered medical dashboard. It must feel like a high-quality mobile health operating system.

## Visual Identity

HealthOS should feel calm, premium, clean, glassy, useful, fast, family-safe, AI-assisted, and privacy-first.

Signature colors:

- Shimmer White: used for glass reflections, light card highlights, subtle borders, skeleton shimmer, and premium surface glow. It is a highlight, not a flat background everywhere.
- Sky Blue: used for primary actions, active nav state, AI glow, selected calendar days, chart primary lines, and progress indicators. Use it sparingly.

Dark mode is the hero mode. It uses deep navy backgrounds, frosted glass cards, soft white text, sky-blue active details, shimmer-white borders, muted blue-grey secondary text, and calm health colors. Avoid pure black except for overlays or deep contrast areas.

Light mode uses soft mist backgrounds, shimmer-white cards, very light sky-blue tint, deep navy text, gentle shadows, and visible glass panels. Avoid plain white pages with harsh grey borders.

## Global Layout Rules

The app is mobile-first. Use full-width screens with safe horizontal padding, compact vertical spacing, comfortable touch targets, bottom nav safe-area spacing, and readable max widths for larger phones.

Default values:

- Horizontal padding: 20
- Small-phone horizontal padding: 16
- Top content gap: 16
- Section gap: 20
- Card gap: 12
- Compact card gap: 8
- Preferred touch target: 44
- Absolute compact secondary minimum: 40

Do not design tablet-first. Do not make controls difficult to tap.

## Radius Rules

Radius scale:

- `xs`: 6
- `sm`: 10
- `md`: 14
- `lg`: 18
- `xl`: 22
- `2xl`: 26
- `pill`: 999

Usage:

- Calendar day cells: `sm` or `md`, not full bubble unless selected.
- Fitness/Nutrition cards: `lg`, less round and more athletic.
- Family/Baby cards: `xl`, softer.
- Bottom nav and AI search bar: `pill`.
- Glass menu: `lg`.
- Large hero cards: `2xl`.
- Pills/chips: `pill`.

## Surface Rules

Use four major card types:

- Elevated card: default dashboard card for Home, Health, Family, Medication, and Records.
- Glass card: nav, AI search, floating menu, camera menu, and compact overlays.
- Dark hero card: Fitness/Nutrition hero sections and premium visual blocks.
- List row: medication schedules, records, family shared updates, and daily plans.

Glass must not be overused. Use it for floating nav, AI command/search, camera scan menu, long-press widget menu, floating filters, small overlay controls, and selected compact panels.

## Typography Rules

Roles:

- Display
- Screen title
- Section title
- Card title
- Body
- Body small
- Caption
- Micro
- Stat number
- Stat label
- Button label
- Tab label
- Chart label

Text should be direct and useful. Avoid inflated wellness marketing language.

## Motion Rules

Motion must make the app feel premium, not slow.

Use Reanimated presets for card press feedback, bottom sheet entry, AI search-to-sheet transition, nav active pill morph, widget long-press menu, menu-to-info transition, calendar month-to-week collapse, chart reveal, camera suggestion pills, and segmented ring draw.

Timing:

- Micro feedback: 90-140ms
- Small transitions: 180-240ms
- Bottom sheet / nav morph: 260-360ms
- Chart reveal: 450-800ms

Every motion preset must have a reduced-motion fallback that avoids spring bounce, excessive scale, chart draw-on, and heavy slide movement.

## Chart Foundation

Charts must be useful, compact, and connected to decisions. Use chart tokens before building any chart.

Future chart types:

- SegmentedRingChart
- MiniSparkline
- ProgressCircle
- MacroRing
- CalendarHeatmap
- MuscleMapChart
- WellnessRadar

Chart style:

- Minimal grid lines
- Soft labels
- Tooltips as glass cards
- Sky-blue primary line
- Realm accent secondary lines
- Avoid rainbow charts
- Readable legends
- Empty, loading, and no-data states

## Navigation Direction

The active app shell will eventually be:

- Home
- Calendar
- Scan / AI
- Health
- Family

Settings must not be a bottom nav item.

Baby/Child, Fitness, Food/Nutrition, Women’s Health, Pregnancy, Medication, Supplements, and Records are not bottom nav items. They are reached from Health hub, Home widgets, Family/member profiles, Calendar event context, AI import results, and Scan results.

## Component Foundation

This phase creates:

- `HealthOSScreen`
- `HealthOSCard`
- `HealthOSGlassMenu`
- `HealthOSWidget`
- `HealthOSSectionHeader`
- `HealthOSPill`
- `HealthOSProgressRingPlaceholder`

## Strict Rules

Do not redesign pages, migrate all hardcoded colors, delete feature routes, delete Supabase/auth/AI logic, replace navigation, build final charts, install new packages unless required, copy Vite/Radix/Recharts/web prototype code, add Settings to bottom nav, or add Baby/Fitness/Food/etc. to bottom nav.

Do create semantic tokens, reusable foundation components, stable imports, documentation, TypeScript types, and simple React Native StyleSheet foundations that prepare for Reanimated/Skia/Victory without overbuilding.

## Verification

Run only:

```bash
npm run typecheck
```

Do not run full build in this phase.
