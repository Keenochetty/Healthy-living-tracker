# HealthOS Style Sheet 21 - Route Wiring QA

## Purpose

Phase 21 locks the route contract after the visual foundation and realm passes. It does not redesign screens or change data behavior.

## Bottom Navigation Contract

The visible bottom navigation remains:

- Home: `/(tabs)/today`
- Calendar: `/(tabs)/calendar`
- Scan: `/(tabs)/scan`
- Health: `/(tabs)/health`
- Family: `/(tabs)/circle`

Settings, profile, notifications/reminders, trusted content, AI, records, medication, supplements, nutrition, fitness, pregnancy, cycle, baby/child, caregiver, elder, device sync, auth, and onboarding stay outside the visible bottom nav.

## Routing Rules

- Main realm entry routes should point to existing route files.
- Hidden tab entry routes use the `/(tabs)/...` group.
- Detail routes such as `/fitness/library`, `/food/recipe`, and `/profile/[profileId]` stay unchanged.
- Route aliases are documented only when the alias file exists or when the alias is explicitly marked as absent.
- Sensitive routes must remain private and require explicit user action before saving, sharing, importing, or sending data elsewhere.

## QA Scope

- Validate bottom nav count and order.
- Validate key cross-realm links from Home, Health Hub, Calendar, Scan, AI, Family, Settings, Reminders, Records, and Trusted Content.
- Identify obvious stale root routes such as `/food`, `/fitness`, `/scan`, `/calendar`, and `/circle` when no matching index route exists.
- Document fake data, sample content, placeholders, and privacy-sensitive surfaces.
- Run TypeScript only.
