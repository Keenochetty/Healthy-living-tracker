# AI Backend Setup

This project must call OpenAI only from a secure backend. The Expo app calls the
Supabase Edge Function `ai-chat`; it never stores or sends an OpenAI API key.

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
supabase secrets set OPENAI_API_KEY=your_server_side_key
supabase secrets set OPENAI_MODEL=gpt-5.5
```

Do not commit real API keys to this repository. If `OPENAI_API_KEY` is missing,
`ai-chat` returns a safe mock response explaining that backend AI is not
configured.

## Integrated Chat

- App-routing questions are handled locally where possible.
- Search, planning, and smart import detection use `ai-chat`.
- Chat history is stored in owner-scoped tables such as `app_ai_chats` and
  `app_ai_messages`.
- Importable AI results remain drafts until the user explicitly confirms.
- Structured import payloads can route to fitness, nutrition, medication,
  supplements, calendar, records, baby/child, cycle, pregnancy, family, and
  shopping-list areas.

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
enabled.

## Safety

- Private files should go to a private bucket later.
- Signed URLs should expire.
- The user must review every output.
- AI drafts do not save directly into health records.
- Medication reminders must not be created without explicit confirmation.
- Circle, partner and caregiver sharing must remain off unless separately approved later.
