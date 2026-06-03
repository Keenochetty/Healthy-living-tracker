# AI Backend Setup

This project must call OpenAI only from a secure backend. The Expo app calls the Supabase Edge Function `ai-extract`; it never needs an OpenAI API key.

## Required

- Supabase CLI installed
- `supabase login`
- `supabase init` if the project has not already been initialized
- Expo environment variables:
  - `EXPO_PUBLIC_SUPABASE_URL`
  - `EXPO_PUBLIC_SUPABASE_ANON_KEY` or the publishable key used by the app

## Secrets

Set OpenAI secrets on Supabase, not in Expo:

```bash
supabase secrets set OPENAI_API_KEY=your_key
supabase secrets set OPENAI_MODEL=gpt-5.4-mini
```

If `OPENAI_API_KEY` is missing, `ai-extract` returns safe mock drafts for UI testing.

## Run Locally

```bash
supabase functions serve ai-extract --env-file ./supabase/.env.local
```

## Deploy

```bash
supabase functions deploy ai-extract
```

## Safety

- Private files should go to a private bucket later.
- Signed URLs should expire.
- The user must review every output.
- AI drafts do not save directly into health records.
- Medication reminders must not be created without explicit confirmation.
- Circle, partner and caregiver sharing must remain off unless separately approved later.
