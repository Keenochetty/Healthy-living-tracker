# AI Storage Plan

Future bucket:

- Name: `ai-inputs`
- Visibility: private
- Path pattern: `profileId/jobId/fileName`

Planned flow:

1. User signs in.
2. Expo app uploads the input to the private `ai-inputs` bucket.
3. App creates or updates an AI job with the private `file_path`.
4. Supabase Edge Function reads the file using service-role access or a short-lived signed URL.
5. User opens ChatGPT with their own account, then pastes selected output into
   HealthSync for local draft parsing.
6. User reviews, edits, approves or discards the draft.
7. Discarded files should be deleted later.

Rules:

- Never make medical documents public.
- Do not add AI provider API keys to Expo or Supabase for this flow.
- Never share AI outputs with circle, partner or caregiver by default.
- Never write AI extraction directly into health records without user approval.
