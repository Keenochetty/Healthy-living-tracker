# Edge Functions Security

Service-role and secret keys belong only in trusted backend code such as Supabase Edge Functions. They must never be shipped in Expo/mobile/web client bundles.

## Prepared Edge Function Boundaries
- `food-api-lookup`
- `barcode-product-lookup`
- `ai-assistant`
- `ai-document-extraction`
- `trusted-content-refresh`
- `private-file-signed-url`
- `data-export`
- `delete-account`
- `medication-supplement-lookup`

## Required Server Checks
- Validate JWT user.
- Reject anonymous access for private operations.
- Check profile permissions server-side.
- Check consent before AI/device sync/export access.
- Use service-role only after user authorization is established.
- Log sensitive metadata-only audit events.
- Never log full health values, document content, prompts with sensitive details, or file bytes.

## Client Boundary
- Expo client uses only `EXPO_PUBLIC_SUPABASE_URL` and publishable/anon key.
- Food API, AI, medication/supplement API, export generation, delete account processing, and private signed URL generation should move through Edge Functions when live secrets are needed.
