# HealthOS Design System Phase 1

Date: 2026-06-16

## Purpose

Phase 1 creates the central HealthOS design-system foundation after the styling reset. It does not redesign full pages, migrate every hardcoded style, replace navigation, or change business/data/auth logic.

## Design Principles

- Calm, clean, premium, and trustworthy.
- Mobile-first layouts for small and large phones.
- Compact cards and widgets without shrinking touch targets below comfortable mobile sizes.
- Shimmer white and soft mist in light mode.
- Deep navy and frosted dark glass in dark mode.
- Sky blue as the primary intelligent/action accent.
- Realm accents exist only as semantic tokens, not route-local palettes.
- Motion should feel fast and helpful, never heavy.

## Color Strategy

Use semantic colors from `src/theme/healthos/palette.ts`.

Screens should not create random local palettes. If a color is needed repeatedly, add a semantic HealthOS token first. Temporary hardcoded colors are allowed only when unavoidable during gradual migration and should be documented in the page prompt or cleanup report.

Core semantic colors include:

- `shimmerWhite`
- `skyBlue`
- `deepNavy`
- `mistBackground`
- `glassWhite`
- `glassDark`
- `inkText`
- `softText`
- `borderSubtle`
- Realm colors for nutrition, fitness, medication, women, pregnancy, baby, records, family, and AI.

## Light And Dark Strategy

Use `getHealthOSPalette(mode)` and `getHealthOSSurfaces(mode)` where components need mode-aware values. Components should derive `mode` from `useColorScheme()` unless they are already inside a theme provider.

Light mode should use mist backgrounds, shimmer white cards, subtle borders, and sky blue highlights.

Dark mode should use deep navy backgrounds, frosted dark surfaces, softer contrast, and the same semantic roles.

## Surface Strategy

Use surface styles from `src/theme/healthos/surfaces.ts`.

Available foundations:

- `appBackground`
- `screenSurface`
- `elevatedCard`
- `compactCard`
- `glassPanel`
- `glassPill`
- `glassMenu`
- `frostedWidget`
- `darkHeroCard`
- `listRow`
- `accordionSurface`
- `dangerSurface`
- `aiSurface`

Do not create duplicate card, widget, or menu wrappers per route. Use `HealthOSCard`, `HealthOSWidget`, and `HealthOSGlassMenu`.

## Motion Strategy

Use presets from `src/theme/healthos/motion.ts`.

Defined presets:

- `pressFeedback`
- `cardLift`
- `sheetEnter`
- `sheetExit`
- `navMorph`
- `widgetLongPressMenu`
- `menuToInfoTransition`
- `calendarCollapse`
- `searchToSheet`
- `chartReveal`
- `segmentedRingDraw`
- `cameraSuggestionPill`
- `reducedMotion`

All animation-heavy interactions must include reduced-motion fallback behavior. Do not implement heavy animation in page work unless the prompt explicitly asks for it.

## Chart Strategy

Use `src/theme/healthos/charts.ts` before building chart components.

The chart foundation includes:

- Background, grid, axis, tooltip, crosshair, line, area, bar, and ring tokens.
- Macro colors.
- Muscle map colors.
- Cycle colors.
- Pregnancy progress colors.
- Medication adherence colors.
- Calendar event colors.

Future chart contracts are defined:

- `SegmentedRingChartSegment`
- `MiniSparklinePoint`
- `ProgressCircleConfig`
- `MacroRingData`
- `CalendarHeatmapCell`
- `MuscleMapRegion`
- `WellnessRadarAxis`

Do not use Recharts, Radix, Vite, or copied web prototype chart code in the Expo app. Future production charts should use Skia, Victory Native, React Native SVG, and the HealthOS chart tokens.

## Component Rules

Created in `src/components/healthos`:

- `HealthOSScreen`
- `HealthOSCard`
- `HealthOSGlassMenu`
- `HealthOSWidget`
- `HealthOSSectionHeader`
- `HealthOSPill`
- `HealthOSProgressRingPlaceholder`

Use these rules:

- Use `HealthOSScreen` for new page foundations.
- Use `HealthOSWidget` for modular Home and Health cards.
- Use `HealthOSGlassMenu` for long-press menus and compact info menus.
- Use `HealthOSPill` for chips, filters, camera suggestions, AI import targets, and onboarding goals.
- Use chart tokens before building any chart.
- Use compact layout rules without reducing touch target usability.

## Navigation Rules

- Settings must not be a bottom nav item.
- Baby/Child, Fitness, Food, Women’s Health, Pregnancy, Medication, Supplements, and Records must not become bottom nav items.
- These sections should be reached through Health, Home widgets, Family/member profiles, or contextual shortcuts.
- The target next phase is app shell rebuild with top header, AI search bar, floating bottom nav, and global screen layout.

## What Was Created

- HealthOS palette module.
- HealthOS token scale.
- HealthOS surface styles.
- HealthOS typography roles.
- HealthOS motion presets.
- HealthOS chart tokens and future chart contracts.
- HealthOS layout helpers.
- HealthOS primitive components.
- HealthOS barrel exports from `src/theme/healthos/index.ts`, `src/theme/index.ts`, and `src/components/healthos/index.ts`.

## What Must Wait

- Full Home redesign.
- Calendar rebuild.
- Scan / AI camera rebuild.
- Health, Family, Fitness, Nutrition, Women’s Health, Pregnancy, Medication, Supplements, and Records redesigns.
- Migration of all hardcoded page colors and route-local `StyleSheet` blocks.
- Final Skia/Victory chart components.
- Widget persistence, widget reorder, and widget removal logic.
- Navigation replacement.

## Phase 2 Shell Note

Phase 2 added shell foundation components under `src/components/healthos/shell`. Future screens can use `HealthOSAppShell`, `HealthOSTopHeader`, `HealthOSAICommandBar`, `HealthOSAICommandSheet`, and `HealthOSFloatingNav` without creating route-local shell variants.

## Phase 3 Auth And Onboarding Note

Phase 3 added HealthOS auth and onboarding primitives under `src/components/healthos/auth` and `src/components/healthos/onboarding`. Future auth/onboarding work should use these instead of route-local cards, inputs, buttons, or pill grids.

## Import Pattern

Future screens should import from the HealthOS barrels:

```ts
import { HealthOSCard, HealthOSScreen, HealthOSWidget } from "@/components/healthos";
import { getHealthOSPalette, healthOSTokens } from "@/theme/healthos";
```

Avoid importing from individual token files unless a low-level primitive needs a focused module.
