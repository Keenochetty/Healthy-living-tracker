# healthos-ai-import

Local draft Supabase Edge Function for Batch 8.

This function is not deployed by this batch. It validates an authenticated request,
checks source and target allow-lists, requires explicit confirmation before private
context is attached, and returns a review-first deferred envelope. Provider calls
remain isolated behind server-only environment variables:

- `OPENAI_API_KEY`
- `HEALTHOS_AI_MODEL`
- `HEALTHOS_AI_IMPORT_MODEL`

It must not write final realm data directly.
