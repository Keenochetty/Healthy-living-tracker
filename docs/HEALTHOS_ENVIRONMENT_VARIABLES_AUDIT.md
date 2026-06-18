# HealthOS Environment Variables Audit

Date: 2026-06-18

## Expo Public Variables

Required by client code:

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` or `EXPO_PUBLIC_SUPABASE_ANON_KEY`

Optional by client code:

- `EXPO_PUBLIC_FITNESS_AI_SEARCH_URL`

The optional fitness-search endpoint placeholder was added to `.env.example`.

## Server / Edge-Only Variables

Referenced by Supabase Edge Functions:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`
- `OPENAI_MODEL`
- `HEALTHOS_AI_MODEL`
- `HEALTHOS_AI_IMPORT_MODEL`

These must remain Supabase secrets or server-only environment variables. They must not be prefixed with `EXPO_PUBLIC_`.

## Client Secret Audit

No direct use of `OPENAI_API_KEY` or `SUPABASE_SERVICE_ROLE_KEY` was found under `src`.

## Readiness Status

Partial. The example file is safe and complete enough for current client code, but real values are not present and were not added. Edge Function secrets were not verified.

