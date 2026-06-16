# AI Backend Setup

This project must not call OpenAI from the Expo app or from Supabase Edge
Functions. HealthSync guides users to use their own ChatGPT account, then paste
only selected results back into the app.

## Required

- Supabase CLI installed
- `supabase login`
- `supabase init` if the project has not already been initialized
- Expo environment variables:
  - `EXPO_PUBLIC_SUPABASE_URL`
  - `EXPO_PUBLIC_SUPABASE_ANON_KEY` or the publishable key used by the app

## ChatGPT Bridge

- Do not add an OpenAI API key to Expo, Supabase, or project docs.
- Do not ask users for ChatGPT credentials.
- Open ChatGPT externally at `https://chatgpt.com/`.
- Users paste selected ChatGPT results into HealthSync.
- HealthSync stores only results the user chooses to use inside the app.
- Future persistence should use owner-scoped tables such as
  `healthsync_ai_sessions` and `healthsync_ai_imports`.

`ai-extract` currently returns safe mock drafts for UI testing. `ai-chat`
returns a disabled response explaining the ChatGPT bridge flow.

## Run Locally

```bash
supabase functions serve ai-extract --env-file ./supabase/.env.local
supabase functions serve ai-chat --env-file ./supabase/.env.local
```

## Deploy

```bash
supabase functions deploy ai-extract
supabase functions deploy ai-chat
```

Do not deploy `ai-chat` with `--no-verify-jwt`. JWT verification must remain
enabled even though the function no longer calls an AI provider.

## Safety

- Private files should go to a private bucket later.
- Signed URLs should expire.
- The user must review every output.
- AI drafts do not save directly into health records.
- Medication reminders must not be created without explicit confirmation.
- Circle, partner and caregiver sharing must remain off unless separately approved later.
