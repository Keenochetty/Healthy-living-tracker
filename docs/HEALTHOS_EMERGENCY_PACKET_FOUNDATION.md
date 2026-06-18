# HealthOS Emergency Packet Foundation

Date: 2026-06-17

## Table

`emergency_packet_items` stores owner-selected records or profile-scoped metadata for future emergency packet assembly.

## Privacy

Emergency packet rows are owner-managed. Shared emergency access is only represented by explicit `sharing_permissions` rows with `emergency_packet_view`.

## Deferred

- Emergency PDF/export generation.
- Emergency packet sharing UI.
- Offline emergency cache.
- Public links.
