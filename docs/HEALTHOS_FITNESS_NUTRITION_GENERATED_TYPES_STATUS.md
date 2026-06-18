# HealthOS Fitness + Nutrition Generated Types Status

`src/types/database.ts` is stale for Batch 9.

The Batch 9 tables are defined only in the migration draft until migrations are applied and Supabase types are regenerated. This phase did not run remote Supabase commands or type generation.

Current mitigation:

- Domain types live in `src/features/fitnessNutrition/fitnessNutritionTypes.ts`.
- Service calls use table-name based access and safe missing-table handling.

Required later:

- Apply migrations in the controlled Supabase environment.
- Regenerate database types.
- Replace table-name casts where generated table types are available.
