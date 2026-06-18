# HealthOS Supabase + AI Edge Readiness Audit

Date: 2026-06-18

## Supabase Client

The Expo client uses `src/lib/supabase.ts` with:

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` or `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- AsyncStorage auth persistence
- Session auto-refresh
- `detectSessionInUrl: false`

## Local Backend Assets

Present locally:

- Supabase migrations through HealthOS backend batches.
- RLS and storage audit docs.
- Edge Functions for AI chat/import, data export, delete account, private file signed URLs, lookup services, and trusted content refresh.

## AI Readiness

`ai-chat` requires authenticated requests and uses `OPENAI_API_KEY` only inside the Edge Function. If the key is missing, it returns a non-saving mock/deferred response.

`healthos-ai-import` requires authenticated requests, validates payloads, summarizes input safely, and returns a review-required deferred envelope. It does not auto-save extracted health data.

## Blockers

- Generated Supabase types are still missing.
- Migrations were not applied in this step.
- RLS actor tests were not run in this step.
- Storage bucket and policy behavior was not tested in this step.
- Edge Function deployment was not run in this step.
- Supabase secrets were not verified in this step.

## Readiness Status

Not ready for production backend validation. Local code structure is present, but staging verification remains required.

