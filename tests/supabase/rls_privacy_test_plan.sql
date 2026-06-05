-- Phase 24 RLS/privacy test plan.
-- Run in a staging Supabase project with seeded users/profiles.
-- Replace placeholder UUIDs before execution.

-- Test cases:
-- 1. User A cannot read User B private health data.
-- 2. Partner cannot view Women’s Health unless shared.
-- 3. Caregiver cannot view private medication unless allowed.
-- 4. Parent cannot view adult child after adult conversion.
-- 5. Child profile is visible to parent/guardian while managed.
-- 6. Baby records are visible only to allowed caregivers.
-- 7. Storage file signed URL is blocked without permission.
-- 8. AI cannot access unconsented data.
-- 9. Widgets cannot leak hidden values.
-- 10. Calendar overlays are hidden without permission.

-- Suggested psql flow:
-- begin;
-- set local role authenticated;
-- set local request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000a1';
-- select * from public.health_records where user_id = '00000000-0000-0000-0000-0000000000b2';
-- -- Expect 0 rows.
-- rollback;

-- Storage checks should verify storage.objects policies and signed URL Edge Function checks.
-- AI checks should verify consent_records plus profile_permissions predicates.
