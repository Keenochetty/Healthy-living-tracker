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
5. Edge Function calls OpenAI and returns structured draft JSON.
6. User reviews, edits, approves or discards the draft.
7. Discarded files should be deleted later.

Rules:

- Never make medical documents public.
- Never expose OpenAI API keys to the Expo app.
- Never share AI outputs with circle, partner or caregiver by default.
- Never write AI extraction directly into health records without user approval.
