# HealthOS Style Sheet 02 - App Shell, Header, AI Command Bar, Floating Nav

## Purpose

This style sheet defines the global HealthOS app shell. The shell is the frame around the product and must make the app feel premium, consistent, simple, and controlled before individual pages are redesigned.

This phase does not redesign Home, Calendar, Scan, Health, Family, Fitness, Nutrition, Women’s Health, Pregnancy, Medication, Records, or deep realm content.

It creates and wires reusable shell components:

- Top app header
- Profile/settings entry
- Notification action
- AI command/search bar
- AI command sheet foundation
- Floating five-item bottom nav
- Global screen spacing
- Header/nav visibility rules
- Scroll-aware behavior hooks
- Route mapping rules

## Product Shell Direction

HealthOS uses one global mobile shell:

1. Top header
2. AI command/search bar
3. Main page content
4. Floating bottom nav

Main bottom navigation:

1. Home
2. Calendar
3. Scan / AI
4. Health
5. Family

Settings is not a bottom nav item.

Baby/Child, Fitness, Food/Nutrition, Women’s Health, Pregnancy, Medication, Supplements, Records, Profile, and Settings are not bottom nav items. They are reached through Health hub, Home widgets, Family/member profiles, Calendar events, AI import result actions, Scan result actions, and the profile avatar/control panel.

## Layout Rules

Normal main tab layout:

```txt
SafeAreaView
  HealthOSAppShell
    TopHeader
    AICommandBar
    PageContent
    FloatingBottomNav
```

Default positioning:

- Header height around 52.
- AI command bar height around 44.
- Header to AI bar gap around 10.
- AI bar to content gap around 16.
- Bottom nav height around 68.
- Bottom nav bottom offset: safe area bottom + 10.
- Content bottom padding includes nav height, safe bottom, and extra breathing room.
- Horizontal padding: 20 on normal phones, 16 on small phones.
- Content/header/AI max width: 430.
- Bottom nav max width: 390.

## Top Header Rules

The top header provides identity, context, notifications, and settings/profile access without crowding bottom nav.

It contains:

- Left profile avatar or initials button.
- Center/left title and optional subtitle.
- Right notification button and optional settings/control button.

Icon-only buttons must have accessibility labels. No business logic belongs inside the header component.

## AI Command Bar Rules

The AI command bar is the main intelligent command surface, not a normal search box.

It supports future actions such as Ask AI, search app, scan/import, find records, add reminders, build meal plans, build workouts, explain medication, and import result into the app.

Tapping the bar opens `HealthOSAICommandSheet`. This phase does not connect to the AI backend or save/import data.

## Floating Bottom Nav Rules

Visible items only:

- Home
- Calendar
- Scan
- Health
- Family

The Scan item may be slightly stronger but must not exceed nav height or become an oversized floating button.

Settings, Profile, Baby/Child, Fitness, Food/Nutrition, Women’s Health, Pregnancy, Medication, Supplements, and Records must not be visible bottom nav items.

## Route Rules

Visible tab routes map to the existing Expo Router tabs:

- Home: `today`
- Calendar: `calendar`
- Scan: `scan`
- Health: `health`
- Family: `circle`

Hidden tab routes such as `fitness`, `food`, and `profile` must remain hidden and must not be deleted.

Auth and onboarding screens must not show the main shell.

Scan can opt out of the normal top header and AI command bar in later page integration.

## Scroll-Aware Behavior

`useHealthOSShellScroll` exposes:

- `scrollY`
- `direction`
- `onScroll`
- `headerCollapsed`
- `navCompressed`

Do not force every page to adopt this hook yet.

## Accessibility Rules

- Icon-only buttons need `accessibilityLabel`.
- Bottom nav items need role/state.
- Active nav item must be clear visually and semantically.
- AI command bar needs an accessible label.
- Reduced motion must be respected where practical.
- Touch targets must remain tappable.

## Strict Rules

Do not redesign page content, replace deep routes, remove business logic, connect final AI backend flows, migrate every hardcoded style, add Settings to bottom nav, add deep realms to bottom nav, install packages, or run a full build.

Do build shell foundation, keep compatibility, use HealthOS tokens, type components properly, and run typecheck only.
