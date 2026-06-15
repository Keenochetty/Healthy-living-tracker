# Environment Variables

## Frontend-Safe Expo Variables

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` while migrating older projects

Only non-secret values may use the `EXPO_PUBLIC_` prefix.

## Server / Edge-Only Variables

- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_SECRET_KEYS`
- `FOOD_API_KEY`
- `AI_API_KEY`
- `DRUGBANK_API_KEY` later
- `EMAIL_API_KEY` later

These must be configured in server or Supabase Edge Function environments only.

## Rules

- Never commit real `.env` files.
- Never put service-role or secret keys in Expo public variables.
- Keep local, staging, and production keys separate.
- Disable verbose logs in production.
- Rotate keys if a secret is suspected to have been exposed.
