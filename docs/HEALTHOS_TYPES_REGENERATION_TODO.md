# HealthOS Types Regeneration Todo

Date: 2026-06-18

## Current State

No full Supabase-generated type file was found. `src/types/database.ts` is manual and profile-focused.

## Todo After Backend Application

1. Confirm the intended Supabase project and environment.
2. Apply or verify the planned backend migration sequence outside Step 36.
3. Regenerate Supabase types into a dedicated generated file, preferably `src/types/database.types.ts`.
4. Update `src/lib/supabase.ts` to use the generated `Database` type if it does not already.
5. Update `src/features/backend/tableRegistry.ts` entries from `missing` to `present` only for tables confirmed in generated types.
6. Remove or narrow `as never` table casts in feature services.
7. Run `npm run typecheck`.

## Explicitly Not Done In Step 36

No remote Supabase commands, migration application, or type generation were run.
