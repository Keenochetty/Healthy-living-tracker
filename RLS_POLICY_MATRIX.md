# RLS Policy Matrix

Every sensitive table must enable RLS before exposure through Supabase Data API.

## Base User/Profile Tables
- SELECT: owner, profile creator for managed child profiles, users with `profile_permissions` view/manage, caregiver only where allowed.
- INSERT: owner for own profile, parent/guardian for managed child, caregiver only with add/manage.
- UPDATE: owner, parent/guardian for managed child, caregiver only with edit/manage.
- DELETE: owner, parent/guardian for managed child, caregiver only with explicit manage.

## Adult/Child/Caregiver
- Adult profile data is private by default.
- Parent access stops on adult conversion unless the adult grants new access.
- Child profile data is parent/guardian/admin-managed.
- Teen transition is represented by permissions; no broad parent wildcard.
- Caregiver access is task/category-scoped and never treated as normal profile ownership.

## Sensitive Realm Categories
- Women’s Health: category-scoped sharing; partners/family/caregivers hidden by default.
- Contraception: private unless explicitly shared by category.
- Pregnancy: owner only by default; selected shared categories only.
- Baby / Child: parent/guardian manage; caregivers view/add assigned sections only.
- Men’s Health: owner only by default; sexual/fertility notes require explicit category grant.
- Records/Documents: owner/permission only; document file access follows record access.
- Device Sync: owner only; never auto-shared.
- AI: consent and permission checked by category before access.

## Required Helper Predicates
- `is_profile_owner(profile_id)`
- `has_profile_permission(profile_id, category, required_level)`
- `can_view_profile_data(profile_id, category)`
- `can_add_profile_data(profile_id, category)`
- `can_edit_profile_data(profile_id, category)`
- `can_manage_profile_data(profile_id, category)`
- `can_view_document(record_id)`
- Category-specific helpers for Women’s Health, Pregnancy, Baby / Child, Men’s Health, and AI consent.
