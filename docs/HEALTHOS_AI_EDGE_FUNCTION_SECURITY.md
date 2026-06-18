# HealthOS AI Edge Function Security

AI requests must cross a server boundary. The Expo client must not contain OpenAI keys, Supabase service-role keys, provider secrets, private prompts, or model routing secrets.

Existing AI Edge Functions found:

- `supabase/functions/ai-chat/index.ts`
- `supabase/functions/ai-extract/index.ts`
- `supabase/functions/ai-assistant/index.ts`
- `supabase/functions/ai-document-extraction/index.ts`

Batch 8 changes:

- `ai-chat` now validates optional `requestedTarget`, requires confirmation before attached context, and returns privacy-safe provider errors.
- `ai-extract` now requires authenticated bearer input through shared auth helper, requires context confirmation, and returns deferred review-first output instead of mock extraction drafts.
- Added local draft `supabase/functions/healthos-ai-import/` with request validation and deferred review-envelope output.

Logging rule: do not log raw health payloads, raw prompts, raw storage paths, or provider errors that may include private context.

Deploy rule: no Edge Function was deployed in this batch.

