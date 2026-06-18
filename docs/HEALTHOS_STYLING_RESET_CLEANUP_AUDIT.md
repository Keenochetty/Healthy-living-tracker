# HealthOS Styling Reset Cleanup Audit

Date: 2026-06-16

## Scope

This audit resets the shared visual foundation only. No feature routes, Supabase/auth logic, storage logic, migrations, AI extraction logic, seed data, or business data flows were removed.

## Files And Areas Inspected

- Active app routes under `src/app`: `(tabs)`, `ai`, `auth`, `baby-child`, `biometrics`, `caregiver`, `child`, `circle`, `cycle`, `dev`, `device-sync`, `elder`, `fitness`, `food`, `health`, `health-calendar`, `join`, `medication`, `mens-health`, `onboarding`, `pregnancy`, `profile`, `records`, `reminders`, `settings`, `supplements`, `trusted-content`.
- Shared component folders under `src/components`: `ai`, `auth`, `baby-child`, `calendar`, `caregiver`, `child`, `circle`, `cycle`, `dashboard`, `elder`, `fitness`, `forms`, `health`, `icons`, `identity`, `layout`, `medication`, `modules`, `native-ios`, `navigation`, `nutrition`, `onboarding`, `privacy`, `records`, `security`, `today`, `ui`, `ui-native`, `widgets`.
- Styling/theme files: `src/theme/tokens.ts`, `src/theme/healthTheme.ts`, `src/theme/colors.ts`, `src/theme/foundationStyles.ts`, `src/theme/designSystem.ts`, `src/theme/spacing.ts`, `src/theme/radius.ts`, `src/theme/shadows.ts`, `src/theme/typography.ts`, `src/constants/themes.ts`, `constants/theme.ts`, `constants/notification-colors.ts`, `global.css`, `src/global.css`, `src/app/onboarding/theme.tsx`.
- UI/config files: `metro.config.js`, `babel.config.js`, `tailwind.config.js`, `nativewind-env.d.ts`, `src/uniwind-types.d.ts`, `components.json`.
- Archived/prototype areas: `_archive/legacy-root-web`, `_archive/next-app-routes`, `design-reference`.

## Styling Systems Found

- Active shared React Native style tokens in `src/theme/*`.
- Active app theme provider in `src/theme/ThemeProvider.tsx`.
- Active Uniwind entry in `src/global.css`, imported by `src/app/_layout.tsx` and referenced by `metro.config.js`.
- NativeWind/Tailwind compatibility in `tailwind.config.js`.
- Legacy/root CSS adapter in `global.css`, still referenced by `components.json`.
- HeroUI Native wrappers in `src/components/ui-native`.
- Legacy app UI primitives in `src/components/ui`.

## Reset Applied

- Replaced old named theme palettes with neutral light/dark placeholder themes while preserving existing `UserThemeKey` values for stored preferences.
- Reset realm accent values to neutral placeholders.
- Reset shared `appColors`, nav colors, glass placeholders, and shadow placeholders.
- Reset active `src/global.css` to minimal placeholder tokens for background, surface, text, muted text, border, primary, radius, and spacing.
- Reset root `global.css` variables to neutral placeholders because `components.json` still references it.
- Reset Tailwind alias palettes (`ink`, `canvas`, `wellness`) to neutral placeholder values.
- Updated theme option labels/descriptions to neutral placeholders.

## Duplicate Systems Found

- `src/components/ui` and `src/components/ui-native` both provide button/card/text/screen-style wrappers. Kept both because active screens still import `src/components/ui`, while HeroUI Native migration uses `src/components/ui-native`.
- `AppMainLayout`, `FloatingBottomNav`, `AiSearchBar`, `AiFloatingQuickBar`, and older `FloatingAssistantButton` all participate in shell/navigation behavior. Kept all because active routes still import them.
- Route-local chart/card functions exist in large feature screens such as `baby-child`, `cycle`, `food`, `fitness`, and medication. Kept because they are embedded in active feature screens.
- Shared chart placeholder wrappers exist in `src/components/health/HealthHubCharts.tsx`; they are actively imported by health, records, nutrition, medication, fitness, baby, and cycle areas.

## Navigation Findings

- Active tab shell: `src/app/(tabs)/_layout.tsx`.
- Active bottom nav: `src/components/navigation/FloatingBottomNav.tsx`.
- Active tabs currently include Home/Today, Calendar, Scan, Health, Family; `fitness`, `food`, and `profile` are hidden tab routes.
- Settings is not an active bottom nav item, which matches the target shell direction.
- Some detail routes (`baby-child`, `cycle`) still render `FloatingBottomNav` and `FloatingAssistantButton` manually. Kept for now because removing them may affect route behavior.

Recommended target shell remains:

- Home
- Calendar
- Scan / AI
- Health
- Family

Settings should remain outside bottom nav. Baby/Child, Fitness, Food, Women’s Health, Pregnancy, Medication, Supplements, and Records should be entered through Health, Home widgets, Family/profile context, or shortcuts.

## Chart Findings

- No active imports of `@shopify/react-native-skia` or `victory-native` were found in `src`.
- Existing charts are currently SVG/View-style placeholders and embedded route-local mini charts.
- Kept Skia and Victory Native because they are explicitly part of the future chart direction.
- Future chart components to add later: `SegmentedRingChart`, `MiniSparkline`, `ProgressCircle`, `MacroRing`, `CalendarHeatmap`, `MuscleMapChart`, `WellnessRadar`.

## Web / Prototype Leftovers

- `_archive/legacy-root-web` and `_archive/next-app-routes` are archived legacy/prototype areas and were not deleted.
- `design-reference/HealthOS_Full_Design_V8.html` is a visual reference only and was not imported into active native code.
- Exact active `src` imports for React DOM, Recharts, Radix UI, Framer Motion, and motion/react were not found during this pass.
- `react-dom` and `react-native-web` remain installed, likely for Expo/web compatibility; no removal was made.

## Files Removed

- None.

## Files Kept And Why

- All route files under `src/app`: kept to preserve navigation and feature coverage.
- Supabase files and edge functions: kept untouched to preserve auth, data, storage, and AI backend behavior.
- `src/components/ui`: kept because many active screens still import these components.
- `src/components/ui-native`: kept as the HeroUI Native wrapper layer.
- `@shopify/react-native-skia` and `victory-native`: kept for planned native chart work.
- `nativewind`, `uniwind`, `tailwindcss`, `heroui-native`, Reanimated, Gesture Handler, and bottom sheet packages: kept because they support the active or intended UI foundation.

## Dependencies Proposed For Removal

- None removed or proposed for immediate removal.

Review-only items for a later dependency pass:

- `react-dom` and `react-native-web`: keep if Expo web/export remains supported.
- `@expo/vector-icons`: no direct active import was identified in this pass, but keep until Expo dependency behavior and icon usage are verified.

## Risks / Unsure Items

- There are still many page-level hardcoded colors and `StyleSheet.create` blocks. Counts from the audit: 2812 hardcoded hex occurrences and 1876 style-related occurrences under `src`. These should be migrated gradually per screen after the blank foundation is accepted.
- Large feature routes contain embedded local UI helpers and chart cards. Removing them now would risk feature regressions.
- Theme key names remain legacy-compatible for saved preferences, even though their labels and values are now neutral.
- `components.json` still points at root `global.css`; it appears to be tooling residue, but it was not deleted.

## Files Changed

- `global.css`
- `src/constants/themes.ts`
- `src/global.css`
- `src/theme/colors.ts`
- `src/theme/healthTheme.ts`
- `src/theme/shadows.ts`
- `src/theme/tokens.ts`
- `tailwind.config.js`
- `docs/HEALTHOS_STYLING_RESET_CLEANUP_AUDIT.md`
