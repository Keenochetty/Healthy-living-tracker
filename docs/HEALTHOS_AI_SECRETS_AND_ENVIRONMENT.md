# HealthOS AI Secrets And Environment

Server-only AI environment names:

```txt
OPENAI_API_KEY=
HEALTHOS_AI_MODEL=
HEALTHOS_AI_IMPORT_MODEL=
```

These names were added to `.env.example` as placeholders only.

Rules:

- Do not prefix these with `EXPO_PUBLIC_`.
- Do not read them in Expo client code.
- Configure them as Supabase secrets only when deploying Edge Functions.
- Do not commit real values.
- Do not run `supabase secrets set` in this batch.

The Expo client continues to use only public Supabase URL and publishable/anon keys.

