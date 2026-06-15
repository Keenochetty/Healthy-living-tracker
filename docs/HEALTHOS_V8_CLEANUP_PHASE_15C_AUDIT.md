# HealthOS V8 Cleanup Phase 15C Audit

## Scope

Phase 15C prunes dependencies proven unused after the verified Phase 15B archive and finalizes the active native import boundary. It does not change native routes, feature behavior, converted screens, Supabase logic, database schema, design references, or archived source.

## Archive And Active App Confirmation

- `_archive/legacy-root-web/` remains intact and reversible.
- `src/app` remains the active Expo Router tree.
- Active `src/` code has no imports into `_archive/legacy-root-web/`.
- Expo export confirmed `Using src/app as the root directory for Expo Router` and bundled web, Android, and iOS successfully.

## Dependency Usage Audit

No active source, script, config, test, or backend import required the removed packages. The backend AI extraction function uses `fetch` directly and does not import the `openai` npm package.

### Dependencies Removed

Runtime dependencies:

- `@radix-ui/react-dialog`
- `@radix-ui/react-dropdown-menu`
- `@radix-ui/react-label`
- `@radix-ui/react-select`
- `@radix-ui/react-tabs`
- `@supabase/ssr`
- `base64-arraybuffer`
- `class-variance-authority`
- `clsx`
- `framer-motion`
- `lucide-react`
- `next`
- `openai`
- `react-dom`
- `recharts`
- `sonner`
- `tailwind-merge`

Development dependencies:

- `@types/react-dom`
- `eslint-config-next`
- `prettier-plugin-tailwindcss`

The lockfile install removed 120 packages from the installed dependency graph across the pruning and lint-tool migration.

### Dependencies Intentionally Kept

- Expo, Expo Router, React, React Native, and native Expo device packages
- `@supabase/supabase-js`
- `react-native-svg`, `react-native-reanimated`, `react-native-safe-area-context`, and `react-native-screens`
- `lucide-react-native`
- `react-native-qrcode-svg`
- `react-native-web`, because Expo web export remains supported
- `nativewind`, `tailwindcss`, `postcss`, and `autoprefixer`, because Metro actively loads `global.css` through NativeWind
- `zod` and other active native/runtime dependencies
- `@expo/vector-icons`, retained cautiously as native-capable Expo tooling despite no direct active import
- `supabase` CLI development dependency

## Scripts And Config Changes

- Package scripts were already Expo-first and remain unchanged.
- Replaced the Next-specific ESLint preset with explicit React, React Hooks, and TypeScript ESLint tooling.
- Added direct development dependencies for `eslint-plugin-react`, `eslint-plugin-react-hooks`, and `typescript-eslint`.
- Preserved the previous lint baseline and excluded the archived tree from active linting.
- Removed all root fallback aliases from `tsconfig.json`; `@/` aliases now resolve only inside `src/`.
- Restricted Tailwind content scanning to `src/**/*`.
- Kept Metro, NativeWind, `global.css`, Tailwind, and PostCSS configuration because they remain active in Expo builds.

## Final Native Import Boundary

The final active `src/` scan found no imports of:

- Next
- React DOM
- Radix
- Framer Motion
- Recharts
- Sonner
- Lucide React DOM package
- `@supabase/ssr`
- removed web utility packages

No direct `window`, `document` DOM access, `localStorage`, `sessionStorage`, or browser navigator API usage was found in active `src/`.

## Files Changed

- `package.json`
- `package-lock.json`
- `eslint.config.mjs`
- `tsconfig.json`
- `tailwind.config.js`
- `docs/HEALTHOS_V8_CLEANUP_PHASE_15C_AUDIT.md`

The Phase 15A generated-artifact cleanup and Phase 15B archive changes remain present and were not reverted.

## Verification Results

Before dependency pruning:

- `npm run typecheck`: passed
- `npm run lint`: passed with one pre-existing fitness hook warning
- `git diff --check`: passed

After dependency pruning:

- `npm install --ignore-scripts`: passed
- `npm run typecheck`: passed
- `npm run lint`: passed with the same pre-existing warning in `src/app/fitness/imported-plan/[importedPlanId].tsx`
- `npm test`: passed
- `git diff --check`: passed
- `npx expo export`: passed for web, Android, and iOS
- Removed dependency top-level graph check: empty
- Active native import-boundary scan: no removed-package or browser-API matches

## Risks And Remaining Decisions

- `npm install` reports 11 moderate-severity audit findings. They were not automatically changed because dependency security remediation is outside this behavior-preserving cleanup.
- The lint configuration intentionally preserves the prior permissive baseline. Tightening unused-variable and TypeScript rules should be a separate, scoped cleanup.
- Root `constants/`, `types/`, `utils/`, `public/`, and the ignored nested `family-health-app/` remain outside this phase.
- The Expo export reads legacy-named `NEXT_PUBLIC_*` environment variables, but active source and build configuration do not require the Next package.
- Real-device behavior, permissions, deep links, notifications, and route interactions still require manual smoke testing.

## Recommended Cleanup Phase 15D Prompt

Implement Cleanup Phase 15D: manual route and real-device smoke testing after dependency pruning.

Requirements:

- Do not redesign screens or change feature behavior.
- Test iOS and Android development builds in dark and light mode.
- Smoke-test every active tab and high-value route, including auth, profile switching, privacy/family visibility, Calendar, Scan permissions and fallbacks, Health, Fitness, Nutrition, Medication, Records, Women’s Health, and Baby/Child.
- Verify deep links, typed routes, notification permission handling, camera permissions, document/image pickers, Supabase session restoration, and Expo Go versus development-build behavior.
- Capture failures using `platform-theme-screen-issue.png`.
- Fix only confirmed regressions with targeted changes.
- Run typecheck, lint, tests, `git diff --check`, and Expo export after fixes.
