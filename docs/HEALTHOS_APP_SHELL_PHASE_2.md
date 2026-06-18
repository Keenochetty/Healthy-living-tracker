# HealthOS App Shell Phase 2

Date: 2026-06-16

## What Was Built

- `src/components/healthos/shell/HealthOSAppShell.tsx`
- `src/components/healthos/shell/HealthOSTopHeader.tsx`
- `src/components/healthos/shell/HealthOSAICommandBar.tsx`
- `src/components/healthos/shell/HealthOSAICommandSheet.tsx`
- `src/components/healthos/shell/HealthOSFloatingNav.tsx`
- `src/components/healthos/shell/HealthOSNavItem.tsx`
- `src/components/healthos/shell/healthOSNavConfig.ts`
- `src/components/healthos/shell/useHealthOSShellScroll.ts`
- `src/components/healthos/shell/index.ts`

The shell exports are also available through `src/components/healthos/index.ts`.

## How The Shell Works

`HealthOSAppShell` composes the Phase 1 primitives into a mobile app shell:

- Top header
- AI command bar
- Main content area
- Floating bottom nav
- AI command sheet foundation

Existing pages are not migrated into `HealthOSAppShell` yet. Page-level adoption should happen in later prompts route by route.

## Active Nav Item Rules

`healthOSNavConfig.ts` contains exactly five visible nav items:

- Home -> `/(tabs)/today`
- Calendar -> `/(tabs)/calendar`
- Scan -> `/(tabs)/scan`
- Health -> `/(tabs)/health`
- Family -> `/(tabs)/circle`

Settings, Profile, Fitness, Food, Medication, Supplements, Records, Pregnancy, Women’s Health, and Baby/Child are not visible bottom nav items.

## Hidden Route Rules

The existing Expo tab layout still keeps `fitness`, `food`, and `profile` hidden with `href: null`.

No routes were deleted.

## Header And Search Visibility Rules

The shell components support disabling header, AI command bar, and bottom nav for full-screen routes. Scan is marked in the nav config as able to hide header/search later.

Auth and onboarding screens should not adopt the main shell.

## AI Command Sheet Limitations

The AI command sheet is UI foundation only:

- No OpenAI call.
- No Supabase write.
- No import/save behavior.
- No command history persistence.

It provides a handle, input, suggestions, recent placeholder, import explanation, and close action.

## Compatibility Components Kept

Kept:

- `src/components/navigation/FloatingBottomNav.tsx`
- `src/components/navigation/FloatingBottomNavItem.tsx`
- `src/components/navigation/FloatingAssistantButton.tsx`
- `src/components/ai/AiSearchBar.tsx`
- `src/components/ai/AiFloatingQuickBar.tsx`
- `src/components/layout/AppMainLayout.tsx`

`FloatingBottomNav.tsx` now bridges to `HealthOSFloatingNav` so existing tab layout imports keep working. Other components remain because active routes still import them and migrating them requires page-by-page shell adoption.

## Future Adoption

Future pages should import:

```ts
import { HealthOSAppShell } from "@/components/healthos";
```

Use `HealthOSAppShell` for new shell-driven pages, and disable header/search/nav for routes that need full-screen behavior.

## What Must Wait

- Full Home shell migration.
- Final Scan camera shell.
- Auth and onboarding styling.
- Replacing all page-level `AppMainLayout` usage.
- AI backend command integration.
- Widget management menus.
- Full route-by-route hardcoded style migration.

## Verification

Run only:

```bash
npm run typecheck
```
