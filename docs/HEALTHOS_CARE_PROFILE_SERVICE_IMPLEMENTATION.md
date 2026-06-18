# HealthOS Care Profile Service Implementation

## Location

`src/features/careProfiles`

## Exports

- Domain types for care profiles, relationships, active profile preferences, and service results.
- Mappers between Supabase snake_case rows and app camelCase models.
- Validation helpers for profile and relationship creation.
- `careProfileService` functions for profile listing, self profile lookup, explicit self profile creation, child identity listing, relationships, and active profile preference updates.
- Hooks for care profiles, self profile, child identity profiles, and active profile preference.

## Runtime Behavior

The service returns `missingTable` when the Batch 2 migration has not been applied. Hooks do not auto-create rows. `ensureSelfCareProfile` is explicit and must be called by a screen or setup flow.
