# HealthOS V8 Expo Conversion Audit

## Scope and Status

- Branch: `ui-v8-conversion-foundation`, tracking `origin/ui-v8-conversion-foundation`.
- Approved reference: `design-reference/HealthOS_Full_Design_V8.html`.
- This phase changes documentation only. It does not redesign screens, add features, remove functionality, or install packages.
- `npm run typecheck` passed before this report was written.

## 1. Current App Architecture

The active application is **Expo-first with a mixed legacy web layer**.

- `package.json` sets `main` to `expo-router/entry`; `app.json` configures Expo plugins and typed routes.
- `app/_layout.tsx` is the root Expo Router stack and wraps the app in `ProfileProvider`.
- `app/index.tsx` is the session/onboarding routing entry point.
- `app/tabs/_layout.tsx` defines the active five-tab Expo navigation.
- Native screens live under `app/` and use React Native primitives, `StyleSheet`, and `expo-router`.
- A separate Next.js/DOM implementation remains under `components/dashboard`, `components/forms`, `components/auth`, parts of `components/ui`, and parts of `lib`. It uses Next navigation/server APIs, HTML elements, Radix, Framer Motion, Recharts, Sonner, and React DOM.

The active tab structure is already close to V8:

| Current Expo tab | V8 destination |
| --- | --- |
| Home | Home |
| Calendar | Calendar |
| Scan | Scan |
| Health (`care.tsx`) | Health |
| Circle | Family |

## 2. Current Styling Situation

Three styling systems coexist:

1. React Native `StyleSheet` styles used by the active Expo screens.
2. Shared native constants in `constants/theme.ts`, `spacing.ts`, `radius.ts`, and `layout.ts`.
3. NativeWind/Tailwind plus CSS variables in `global.css` and `tailwind.config.js`, used mainly by the dormant DOM/Next layer.

The source of truth for the Expo conversion should be typed React Native tokens:

- Keep `constants/theme.ts`, `constants/spacing.ts`, `constants/radius.ts`, and `constants/layout.ts`.
- Refactor those files to expose V8 semantic light/dark tokens, realm tokens, typography, and component metrics.
- Keep `global.css` only as a web adapter. It must not be the canonical theme.
- Do not use CSS variables, `backdrop-filter`, DOM gradients, or Tailwind classes as the native component contract.

Current native constants are internally consistent but visually represent the older warm/light design. V8 is dark-first and uses tighter spacing, smaller cards, stronger realm accents, and compact typography.

## 3. V8 Design Reference Breakdown

### Color Tokens

Dark base:

| Token | Value |
| --- | --- |
| `bg` / `bg2` | `#081118` / `#0e1821` |
| `surface` / `surface2` / `surface3` | `#111e29` / `#152533` / `#1b2d3b` |
| `glass` / `glass2` | `rgba(255,255,255,.075)` / `.12` |
| `border` / `border2` | `rgba(255,255,255,.10)` / `.17` |
| `text` / `muted` / `muted2` | `#f5fbff` / `#90a4b4` / `#617282` |
| `primary` / `primary2` | `#70f1c7` / `#65d8ff` |
| `danger` / `warning` | `#ff6f8e` / `#ffd166` |

Light base:

| Token | Value |
| --- | --- |
| `bg` / `bg2` | `#edf7f4` / `#f8fbfa` |
| `surface` / `surface2` / `surface3` | `#ffffff` / `#f3f8f6` / `#edf3f1` |
| `text` / `muted` / `muted2` | `#132127` / `#62747d` / `#88959b` |

Realm accents:

| Realm | Accent | Personality |
| --- | --- | --- |
| Vitals/Health | `#70f1c7` | stable, unified, clinical-calm |
| Fitness | `#9aff6f` | energetic, progress and training |
| Food | `#ffb85c` | warm, practical, macro-focused |
| Women's health | `#ff86bf` | private, explicit sharing |
| Baby/Child | `#ffd76a` | warm, immediate care actions |
| Family | `#8cb7ff` | shared care and collaboration |
| Medication | `#b99bff` | adherence and safety warnings |
| Records | `#8be4ff` | searchable, document-oriented |
| Mind | `#b5ffdf` | calm and lightweight |

### Spacing, Radius, and Shadows

- Mobile screen horizontal padding: `18px`, reduced to `16px` under `470px`.
- Screen top padding: `42px`; bottom content clearance: `148px`.
- Section gap: `18px`; common grid/card gap: `8-10px`.
- Standard card padding: `14px`; compact card padding: `12px`.
- Radius scale: `14`, `18`, `24`, `30`; cards use `22px`, compact cards `19px`.
- Touch controls are generally `40-48px`; bottom-nav items are `48px`; camera control is `70px`.
- Glass panels combine translucent surfaces, thin borders, and soft shadows. Native should approximate this with opaque/translucent colors and platform shadows; blur is optional and must not define layout.

### Typography

- System/Inter-style sans serif; do not add a font dependency in Phase 1.
- Kicker: `11px`, uppercase, wide tracking, heavy.
- Supporting copy: `11-13px`.
- Section heading: `16px`.
- Card/realm titles: `12-16px`, heavy.
- Main screen title: `24px`, heavy, tight tracking.
- Hero/metric values: `25-32px`, very heavy, tight tracking.

Use a typed typography scale rather than repeating font sizes and weights in screens.

### Cards and Charts

- Cards are compact glass/surface panels with a one-pixel border, `19-22px` radius, and restrained shadows.
- Hero cards use `30px` radius, realm-tinted backgrounds, concise text, and one or two actions.
- Metric cards pair a label, large value, delta, and optional small progress ring.
- Charts are intentionally compact: progress rings, mini line/spark charts, vertical bars, macro donut, and short progress bars.
- Native charts should use the existing `react-native-svg`; do not port Recharts or HTML/SVG markup directly.

### Navigation and AI Behavior

- Bottom navigation is `Home · Calendar · Scan · Health · Family`.
- Scan remains centered but is not oversized or visually dominant.
- Active tab uses a contained surface treatment. On narrow mobile, labels remain hidden.
- A persistent AI search bar sits above the bottom nav.
- Tapping the AI bar opens a slide-up assistant sheet with a search field and a two-column suggestion grid.
- Suggestions route into app destinations/actions: records, food, medication, fitness, scan, and calendar.
- Native behavior should use Expo Router plus the existing native `BottomSheet`; online research and action creation remain future behavior, not Phase 1 scope.

### Scan Screen

- Camera-first full-height scanner surface.
- Header contains context and close action.
- Scanner contains preview status, a framed scan target, animated-looking scan line, type chips, centered shutter control, and classification/import guidance.
- V8 categories: Food, Medication, Record, Workout, Symptom, Baby.
- Preserve permission-on-demand behavior and review-before-save semantics.

### Health Hub

- Health is a whole-life overview, not only a care/medical shortcut screen.
- Top card shows one unified score and summary.
- A compact three-column realm grid is the primary hierarchy.
- Supporting metrics/charts sit below the realm grid.
- Realm pages inherit the shared shell but express their accent and domain-specific cards.

### Calendar

- Full month grid with seven columns.
- Today is filled with the primary accent.
- Small markers indicate health/private and family/shared overlays.
- Month view is followed by a selected-day agenda timeline.
- Filters and privacy overlays are part of the intended structure.

## 4. Mobile-Safe Expo Component Conversion Map

| V8 concept | Expo component | Approach |
| --- | --- | --- |
| Screen shell | `AppScreen` | Refactor current native component for V8 background, safe areas, and nav/AI clearance. |
| Top bar | `AppHeader` | Refactor current native component; support avatar, kicker, title, trailing action, compact mode. |
| Standard/hero card | `AppCard` | New native primitive replacing visual use of `WidgetCard`; variants: standard, compact, flat, hero. |
| Metric card | `MetricCard` | Extract from current `HealthCard` and repeated screen metric markup. |
| Realm shortcut | `RealmCard` | New compact pressable using realm semantic tokens. |
| Buttons | `AppButton` | New native primitive with primary, secondary, ghost, icon variants. |
| Chips/tags | `AppChip` | Consolidate `QuickActionButton`, filters, tags, and compact selected states. |
| Tab bar | `BottomNav` | Implement through Expo Router `Tabs` styling; do not create DOM-style navigation. |
| Persistent AI entry | `AiSearchBar` | Refactor the current `FloatingAIButton` from floating/expanding button into the V8 bar. |
| AI panel | `AiAssistantSheet` | Compose from native `BottomSheet`, search input, and suggestion actions. |
| Scanner visual | `ScanCameraMock` | Native preview/frame/chips/shutter component; later accepts real camera content. |
| Month calendar | `CalendarMonthView` | New native seven-column month grid; reuse calendar data/helpers. |
| Health hub | `HealthOverviewHub` | Screen-level composition of score, realm grid, and chart cards. |
| Chart container | `ChartCard` | AppCard variant with title, metadata, and chart slot. |
| Progress chart | `ProgressRing` | Build with `react-native-svg` circles. |
| Spark chart | `MiniLineChart` | Build with `react-native-svg` paths. |
| Macro chart | `DonutChart` | Build with `react-native-svg` circle segments. |
| People stack | `AvatarStack` | Native overlapping avatar row with count/add state. |

## 5. Files and Components to Keep

Keep behavior, routing, data, and native foundations:

- `app/_layout.tsx`, `app/index.tsx`, `app/tabs/_layout.tsx`
- All current routes and working feature flows under `app/`
- `lib/profile-context.tsx`, auth/session helpers, calendar helpers, permission/privacy logic, Supabase integration
- `types/` and domain constants
- `components/ui/AppIcon.tsx`
- Native `components/ui/app-screen.tsx`, `app-header.tsx`, `bottom-sheet.tsx`, `status-pill.tsx`, `status-surface.tsx`, `child-avatar.tsx`, and native state components as refactor bases
- `components/calendar/DayTimeline.tsx`, `CalendarEventCard.tsx`, and calendar data/filter logic
- Expo packages already configured, including `expo-camera`, `expo-image-picker`, `expo-document-picker`, `react-native-reanimated`, and `react-native-svg`

## 6. Files to Replace or Refactor

Priority refactors:

- `constants/theme.ts`, `spacing.ts`, `radius.ts`, `layout.ts`: convert to the canonical V8 semantic token system.
- `app/tabs/_layout.tsx`: restyle to V8 nav and host the AI bar/sheet safely.
- `components/ui/floating-ai-button.tsx`: replace its expanding floating-button presentation with `AiSearchBar` plus `AiAssistantSheet`; preserve useful keyboard and voice fallback logic.
- `components/ui/widget-card.tsx`, `health-card.tsx`, `quick-action-button.tsx`: migrate visual responsibilities to `AppCard`, `MetricCard`, `AppButton`, and `AppChip`.
- `app/tabs/home.tsx`, `calendar.tsx`, `scan.tsx`, and `care.tsx`: split and convert after primitives exist.
- `components/calendar/CalendarStrip.tsx`: replace the 7/14-day wrapped strip with a true month view while preserving selection and event data behavior.

Separate or quarantine from the Expo-native UI:

- DOM UI files in `components/ui`: `alert.tsx`, `badge.tsx`, `button.tsx`, `card.tsx`, `dialog.tsx`, `input.tsx`, `label.tsx`, `select.tsx`, `sheet.tsx`, `skeleton.tsx`, `states.tsx`, `tabs.tsx`, `textarea.tsx`.
- `components/dashboard/**`, `components/forms/**`, and current DOM auth components.
- Next-only modules in `lib/auth/actions.ts`, `lib/health/actions.ts`, `lib/health/data.ts`, and `lib/supabase/{server,proxy}.ts`.

Do not delete these during initial conversion. Stop exporting DOM components from the native `components/ui/index.ts` barrel and isolate them behind an explicit web boundary first.

## 7. Risks

- **Mixed runtime imports:** the shared UI barrel exports native and DOM/Radix modules together. A native screen can accidentally pull a web-only dependency into Metro.
- **Duplicate filenames/casing:** files such as `AppHeader.tsx` and `app-header.tsx`, `WidgetCard.tsx` and `widget-card.tsx`, and similar wrappers create Windows/Linux casing risk and unclear ownership.
- **Competing theme sources:** `constants/theme.ts`, `global.css`, and `tailwind.config.js` disagree. Only typed native tokens should drive Expo UI.
- **Web-only dependencies:** Next, Radix, Framer Motion, Recharts, Sonner, Lucide React, and React DOM must not be used in native conversion components.
- **Web-only APIs:** `window.localStorage`, speech recognition, Next server actions, and Next navigation require platform adapters or isolation.
- **Large screens:** `app/tabs/home.tsx` is about 1,083 lines; profiles about 827; calendar about 599. Visual conversion without extraction will increase regression risk.
- **One-line prototype sections:** the HTML is intentionally compressed and should be treated as a design artifact, not copied into implementation.
- **Visual portability:** CSS `backdrop-filter`, `color-mix`, conic gradients, and DOM shadows do not translate directly to React Native.
- **Chart portability:** Recharts is web-only. Native charts must use `react-native-svg`; no new chart package is required initially.
- **Behavior preservation:** current privacy, family/care-circle, calendar, auth, and permission flows are more complete than the visual prototype. The conversion must wrap them, not replace them with prototype placeholders.

## 8. Recommended Implementation Order

1. Create typed V8 semantic tokens for dark/light surfaces, text, borders, status, realms, spacing, radii, typography, shadows, and component metrics.
2. Split the native UI barrel from DOM/web UI exports and resolve duplicate casing wrappers without changing behavior.
3. Build and verify native primitives: `AppScreen`, `AppHeader`, `AppCard`, `AppButton`, `AppChip`, `MetricCard`, `RealmCard`, and `AvatarStack`.
4. Build SVG primitives: `ProgressRing`, `MiniLineChart`, and `DonutChart`.
5. Restyle Expo Router tabs to V8 and introduce `AiSearchBar` plus `AiAssistantSheet`.
6. Split `app/tabs/home.tsx` into sections, then convert Home as the first reference screen.
7. Convert `app/tabs/care.tsx` into `HealthOverviewHub`, preserving existing health routes and permission/privacy behavior.
8. Build `CalendarMonthView`, then convert the calendar screen while preserving event creation, details, filtering, and privacy.
9. Build `ScanCameraMock`, then convert Scan without changing camera permissions or save behavior.
10. Convert Family/Circle and the realm/detail screens incrementally.
11. Convert auth/onboarding/settings last, using the established primitives.
12. After each screen: run typecheck/lint, verify native phone layout, verify web as secondary, and test existing navigation/actions.

## Recommended Phase 1 Prompt

```text
You are working on my Expo React Native health app.

Use these approved planning references:
- design-reference/HealthOS_Full_Design_V8.html
- design-reference/PHASE_0_CONVERSION_AUDIT.md

Phase 1 is design-system foundation only.

Important:
- Expo React Native is primary; web is secondary.
- Do not paste HTML/CSS into Expo screens.
- Do not redesign feature screens yet.
- Do not add product features.
- Do not delete or break working routes, data flows, privacy logic, auth, calendar behavior, or permissions.
- Do not install new libraries.

Tasks:
1. Refactor the typed native design tokens in constants/theme.ts, constants/spacing.ts, constants/radius.ts, and constants/layout.ts to represent HealthOS V8 dark/light semantic tokens, realm accents, typography, shadows, and component metrics.
2. Separate native UI exports from DOM/web-only UI exports so Metro-native code cannot accidentally import Radix, HTML, Next, Recharts, Framer Motion, or React DOM components.
3. Consolidate duplicate-casing UI wrappers safely.
4. Build or refactor these native primitives only:
   - AppScreen
   - AppHeader
   - AppCard
   - AppButton
   - AppChip
   - MetricCard
   - RealmCard
   - AvatarStack
   - ProgressRing
   - MiniLineChart
   - DonutChart
5. Use react-native-svg for chart primitives.
6. Add focused tests or a native component showcase route only if it can be done without changing production navigation.

Do not convert Home, Calendar, Scan, Health, or Family screens in this phase.

Verify with:
- npm run typecheck
- npm run lint
- git diff --check

Output:
- summary of foundation changes
- any compatibility decisions
- verification results
- recommended Phase 2 prompt for Home, tabs, and AI search conversion
```
