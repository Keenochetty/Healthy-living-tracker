# HealthOS Supabase Type Generation Plan

Date: 2026-06-17

## Current Status

No generated `database.types.ts` file was found. The repo currently has handwritten `src/types/database.ts`, which is not a full Supabase schema type.

## Future Sequence

1. Apply approved local migrations in order.
2. Generate Supabase database types.
3. Commit generated types to a stable path.
4. Type the Supabase client with the generated `Database` type.
5. Replace handwritten row assumptions in services with generated row/insert/update types.
6. Run `npm run typecheck`.
7. Document the generation command and source project.

## Command Policy

No type generation command was run in Phase 25. Remote generation and schema introspection are deferred until the user explicitly starts an implementation phase.

