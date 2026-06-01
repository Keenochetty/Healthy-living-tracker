# Family Health App

Expo Router app for managing family profiles, medical records, reminders, caregiver workflows, and private document workflows with Supabase.

## Setup

1. Copy `.env.example` to `.env`.
2. Add your Supabase project values:

```env
EXPO_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
EXPO_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_PUBLISHABLE_OR_ANON_KEY
NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_SUPABASE_PUBLISHABLE_OR_ANON_KEY
NEXT_PUBLIC_SITE_URL=http://localhost:8084
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM=
```

3. Run the SQL migrations in `supabase/migrations` against your Supabase project, in filename order.
4. Start the app:

```bash
npm run dev
```

## Checks

```bash
npm run typecheck
npm run build
```

## MVP Features

- Email/password sign up, sign in, onboarding, and sign out
- Supabase Auth client setup with Expo-compatible session storage
- Expo Router tabs and feature routes
- Profile, family, caregiver, child, notification, calendar, activity log, AI assistant, and security settings foundations
- Reusable cards, loading states, empty states, and error states
- Expanded SQL schema, indexes, RLS policies, and private storage bucket migration
- Supabase Realtime publication migration for shared health, care, and calendar tables
- Family profiles, tracking logs, reminders, documents, AI chat, SMTP placeholders, and subscription status storage
