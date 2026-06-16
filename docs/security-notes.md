# Security Notes

This Expo app only uses public Supabase keys:

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` as a compatibility fallback

The Supabase service role key must never be added to Expo, checked into source, or exposed through a public environment variable.

Do not store AI provider API keys in the mobile app or Supabase for the
HealthSync ChatGPT bridge. Users use their own ChatGPT account outside the app
and paste only selected results back into HealthSync.

RLS is required for all user data. The Step 17 profile foundation allows authenticated users to access only rows where their `auth.uid()` owns the profile id.

AsyncStorage is used only for local testing and non-sensitive setup backup: profile preferences, selected modules, selected widgets, theme, country, units, and onboarding completion.

Health logs, child records, pregnancy or cycle data, caregiver data, elder-care data, AI drafts, and private documents are not synced in this step. Those areas need stricter table-specific policies later.

Private documents must use private Supabase Storage buckets and signed URLs with short expiry windows.

If running SQL manually:

- Run `supabase/migrations/20260602205116_step_17_profile_preferences_sync.sql` in the Supabase SQL editor.
- Confirm RLS is enabled on `profiles`, `profile_settings`, `profile_modules`, and `profile_widgets`.
- Confirm authenticated users can only select, insert, update, and delete their own rows.
- Never disable RLS for health, child, pregnancy, caregiver, elder, AI, or document data.
