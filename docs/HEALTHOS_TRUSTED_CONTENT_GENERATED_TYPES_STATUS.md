# HealthOS Trusted Content Generated Types Status

`src/types/database.ts` does not include Batch 10 trusted content tables.

Current mitigation:

- Domain types live in `src/features/trustedContent/trustedContentTypes.ts`.
- Supabase calls use table-name casts and graceful `missingTable` handling.

Required later:

- Apply migration in a controlled Supabase environment.
- Regenerate Supabase database types.
- Replace table-name casts where generated table types are available.
