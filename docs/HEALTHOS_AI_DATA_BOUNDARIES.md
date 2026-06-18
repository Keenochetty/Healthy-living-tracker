# HealthOS AI Data Boundaries

Date: 2026-06-17

## Backend Boundary

AI provider secrets are backend-only:

- `supabase/functions/ai-chat/index.ts` reads `OPENAI_API_KEY` from Deno env.
- `supabase/functions/ai-extract/index.ts` and related files use Edge Function boundaries.
- `src/lib/supabase.ts` uses only Expo public Supabase URL and anon/publishable keys.
- `.env.example` explicitly warns not to put service-role or secret keys in Expo public variables.

## Tables

AI-related tables found:

- `ai_chat_sessions`
- `ai_messages`
- `ai_actions`
- `ai_chats`
- `app_ai_chats`
- `app_ai_messages`
- `app_ai_imports`
- `app_ai_actions`
- `app_ai_scan_results`
- `healthsync_ai_sessions`
- `healthsync_ai_imports`
- `ai_plan_search_logs`

## Rules

- AI conversations may contain health data and should be private by default.
- AI imports are drafts and require user review before saving into app modules.
- Raw model responses should not become trusted content.
- AI context attachment requires explicit user confirmation.
- AI scan/source evidence must not expose raw private storage paths.

## Risks

- Legacy AI tables with family-level access should be restricted or migrated to owner-only tables.
- Retention policy for AI prompts, outputs, imports, and scan payloads is not fully documented in schema.
