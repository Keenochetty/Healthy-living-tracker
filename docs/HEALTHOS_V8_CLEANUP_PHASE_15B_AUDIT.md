# HealthOS V8 Cleanup Phase 15B Audit

## Scope

Phase 15B proves whether the legacy root app/web tree can be archived without changing the active HealthOS V8 Expo application. The archive is reversible and preserves the original folder structure.

No native feature behavior, routes, dependencies, backend logic, Supabase logic, database schema, assets, or package files were changed.

## Active App Confirmation

`src/app` remains the only active Expo Router application tree.

Evidence:

- `package.json` uses `expo-router/entry`.
- `app.json` enables the Expo Router plugin and typed routes.
- `tsconfig.json` includes `src/**/*.ts`, `src/**/*.tsx`, and generated `.expo/types/**/*.ts`.
- `tsconfig.json` excludes `_archive`.
- The pre-archive Expo export explicitly reported `Using src/app as the root directory for Expo Router`.
- The pre-archive Expo export successfully bundled web, iOS, and Android.
- TypeScript module resolution found zero active `src/` imports resolving into root legacy folders.

## Usage Map Summary

### Active `src/` Imports Into Root Folders

TypeScript module resolution was run across active `src/**/*.ts` and `src/**/*.tsx` files using the repository's actual `tsconfig.json`.

Results:

| Root path | Active `src/` imports resolving there | Decision |
| --- | ---: | --- |
| root `app/` | 0 | Archived |
| root `components/` | 0 | Archived |
| root `lib/` | 0 | Archived |
| root `constants/` | 0 | Left in place cautiously |
| root `types/` | 0 | Left in place cautiously |
| root `utils/` | 0 | Left in place cautiously |
| root `hooks/` | Not present | No action |

No active `src/` file imports root web-only UI components.

### Root App

Root `app/` contained 57 tracked legacy route files, including:

- older `app/tabs/*` routes
- legacy settings pages
- legacy circles, caregiver, invite, privacy, calendar, and health pages
- Next-oriented auth and assistant pages

It was not part of the active Expo Router route map and was outside active TypeScript coverage.

### Root Components

Root `components/` contained 102 tracked legacy and compatibility files:

- legacy native wrappers and casing duplicates
- DOM/Radix UI components
- Next dashboard components
- legacy auth/forms/settings/calendar/caregiver/circle components
- web-only components using Next, React DOM, Recharts, Framer Motion, and Sonner

These components were referenced by the root legacy tree but not by active `src/`.

### Root Lib

Root `lib/` contained 31 tracked legacy files:

- Next server actions and navigation helpers
- web Supabase SSR/proxy/server helpers
- browser storage helpers
- legacy calendar, settings, permissions, invites, circles, caregiver, and health modules

These files were referenced by the root legacy tree but not by active `src/`.

### Scripts, Configs, And Deployment References

- `scripts/generate-muscle-body-paths.mjs` targets `src/components/fitness/muscle-map/bodyPathData.ts`.
- `tests/qa-runner.js` reads active `src/lib` files.
- No `.github` workflow directory is present.
- No active script or Expo config references root `app/`, root `components/`, or root `lib/`.
- `metro.config.js` still uses `global.css` through NativeWind; it was left in place.
- `eslint.config.mjs` still uses `eslint-config-next`; dependencies remain installed as required by Phase 15B.

## Archive Actions Taken

The following paths were moved in one reversible operation to `_archive/legacy-root-web/`, preserving their original structure:

- `app/` -> `_archive/legacy-root-web/app/`
- `components/` -> `_archive/legacy-root-web/components/`
- `lib/` -> `_archive/legacy-root-web/lib/`
- `next.config.ts` -> `_archive/legacy-root-web/next.config.ts`
- `next-env.d.ts` -> `_archive/legacy-root-web/next-env.d.ts`
- `proxy.ts` -> `_archive/legacy-root-web/proxy.ts`

Archived tracked-file count:

- root `app/`: 57
- root `components/`: 102
- root `lib/`: 31
- Next-only entry/config files: 3
- total: 193

The archive can be reversed by moving those paths back to the repository root.

## Files And Paths Left In Place

The following were intentionally left in place:

- `src/`: active HealthOS V8 Expo application
- `assets/`: active native assets
- `constants/`, `types/`, and `utils/`: zero active imports were found, but these were outside the cautious archive scope and may still be reference/shared material
- `data/`, including fitness content
- `supabase/`: backend schema and migrations
- `design-reference/` and `docs/`
- `public/`: not required by active Expo imports, but left for cautious future web/dependency review
- `global.css`: actively referenced by Metro/NativeWind
- `tailwind.config.js`, `postcss.config.js`, and NativeWind files: retained because the active Expo toolchain still references NativeWind/global CSS
- `package.json`, `package-lock.json`, environment templates, Expo configs, Babel config, Metro config, and ESLint config
- all dependencies, including web-only dependencies

## Native/Web Import Boundary Result

Active `src/` code has no imports resolving into the archived root tree.

No active native imports of the following were found:

- Radix
- Next
- React DOM
- Recharts
- Framer Motion
- Sonner
- root DOM-only UI components
- root browser-storage helpers

The archive therefore removes the legacy web implementation from the active root without changing native imports.

## Verification Results Before Archive

- `npm run typecheck`: passed
- `npm run lint`: passed with one pre-existing warning in `src/app/fitness/imported-plan/[importedPlanId].tsx`
- `git diff --check`: passed
- `npx expo export`: passed for web, iOS, and Android
- Expo export confirmed `src/app` as the router root

## Verification Results After Archive

- `npm run typecheck`: passed
- `npm run lint`: passed with the same pre-existing fitness hook warning
- `git diff --check`: passed
- `npm test`: passed
- `npx expo export`: passed for web, iOS, and Android
- Post-archive Expo export again confirmed `src/app` as the router root
- Post-archive TypeScript module resolution found zero root fallback resolutions and zero unresolved active imports

## Risks And Remaining Decisions

- `tsconfig.json` still contains fallback path aliases to root `components`, `lib`, `constants`, `types`, and `utils`. Active imports currently resolve entirely within `src/`, but Phase 15C should remove unnecessary fallback aliases after another verification pass.
- Web-only dependencies remain installed by design. Dependency removal must wait until Phase 15C.
- `eslint.config.mjs` uses `eslint-config-next`; pruning Next dependencies requires replacing or simplifying this ESLint configuration first.
- `global.css`, NativeWind, Tailwind, and PostCSS remain connected to the active Metro configuration and must not be removed without a separate native styling audit.
- Root `constants/`, `types/`, `utils/`, and `public/` remain outside the archive pending a narrower usage and ownership decision.
- External systems not represented in the repository cannot be proven automatically. No in-repository CI or deployment workflow references the archived paths.

## Recommended Cleanup Phase 15C Prompt

Implement Cleanup Phase 15C: prune proven-unused legacy web dependencies and finalize active import boundaries after the verified Phase 15B archive.

Requirements:

- Keep `_archive/legacy-root-web` intact and reversible.
- Remove unnecessary root fallback aliases from `tsconfig.json` only after confirming all active imports resolve within `src/`.
- Audit and update `eslint.config.mjs` before removing `eslint-config-next`.
- Determine whether NativeWind, `global.css`, Tailwind, and PostCSS remain required by active native code.
- Identify and remove only dependencies proven unused by active source, scripts, configs, and tests.
- Reassess root `constants/`, `types/`, `utils/`, and `public/`.
- Do not change app behavior, routes, Supabase logic, schemas, or feature screens.
- Run typecheck, lint, tests, Expo export, and route smoke checks after each dependency/configuration group.
