# HealthOS AI Provider Deferred Plan

Provider execution remains behind Supabase Edge Functions.

Deferred work:

- Replace deferred `healthos-ai-import` response with a provider call after secrets are configured.
- Add structured output mapping into `ai_import_envelopes`.
- Persist extraction jobs and envelopes server-side using authenticated user context.
- Add source evidence rows after secure upload/source reference flow is complete.
- Add provider-specific moderation/error normalization without exposing raw provider errors.

Still out of scope:

- Diagnosis.
- Medication advice.
- Child dosage.
- Pregnancy risk scoring.
- OCR engine implementation.
- Voice assistant.
- Push notification backend.

