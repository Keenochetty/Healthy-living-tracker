# HealthOS Database Types Audit

Date: 2026-06-17

## Result

No generated Supabase `database.types.ts` file was found during this pass.

The only database type file found is `src/types/database.ts`, which is handwritten and currently covers:

- `ProfileRow`
- `ProfileSettingsRow`
- `ProfileModuleRow`
- `ProfileWidgetRow`

## Risk

The handwritten type file does not reflect the full migration set. This can hide query drift, missing columns, incorrect table names, and missing generated union types.

## Recommendation

After schema decisions are accepted and the Supabase project is available locally, generate database types and wire the Supabase client to the generated `Database` type.

No type generation command was run in this pass because the user requested local static review only and no remote Supabase commands.

