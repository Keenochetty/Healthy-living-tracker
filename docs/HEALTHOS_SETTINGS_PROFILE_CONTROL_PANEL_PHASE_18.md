# HealthOS Settings / Profile Control Panel Phase 18

Date: 2026-06-17

## Scope

Phase 18 replaces the active `/settings` route with a HealthOS Profile Control Panel. No bottom-nav item was added. No Supabase schema, auth, storage, AI, seed, or migration logic was removed.

## Files Inspected

- `src/components/healthos/shell/HealthOSTopHeader.tsx`
- `src/components/healthos/shell/HealthOSAppShell.tsx`
- `src/app/settings/index.tsx`
- `src/app/(tabs)/profile.tsx`
- `src/app/profile/[profileId].tsx`
- `src/context/AuthContext.tsx`
- `src/lib/profile-settings.ts`
- `src/lib/profilePreferences.ts`
- `src/lib/accountData.ts`
- `src/lib/devicePermissions.ts`
- `src/services/reminders/notificationService.ts`
- `src/lib/familyPermissionsStorage.ts`
- `package.json`

## Files Created

- `src/components/healthos/settings/*`
- `docs/style-sheets/HEALTHOS_STYLE_SHEET_18_SETTINGS_PROFILE_CONTROL_PANEL.md`

## Files Updated

- `src/app/settings/index.tsx`
- `src/components/healthos/index.ts`
- `src/components/healthos/shell/HealthOSAppShell.tsx`

## Implementation Notes

- Active Profile/Settings route: `/settings` renders `HealthOSProfileControlPanelScreen`.
- Top-bar avatar/profile entry: `HealthOSAppShell` now defaults avatar tap to `/settings` when no custom handler is provided.
- Data sources used: `useAuth`, device permission helper, notification settings helper, family permission storage, app constants.
- Placeholder status: billing, connected devices, photo upload storage, 2FA, export, cache clear, support, and delete account are foundation-only unless existing route support is available.
- Profile hero: implemented with real profile/email/avatar when present.
- Profile photo: action sheet exists; upload/remove storage is deferred.
- Personal info: real profile/preferences data only.
- Security: password routes to existing forgot-password flow; 2FA/session rows are foundations.
- Device permissions: real camera/photos/notification status where available.
- Notifications: real notification settings/category count where available.
- Privacy/sharing: private by default with family/privacy route actions.
- Family/caregiver summary: real local family circle/member/invite/permission counts.
- Subscription/billing: foundation rows; no billing package or provider added.
- Connected devices: foundation rows; no native health integration added.
- Appearance/preferences: real theme/units/country where available.
- Data/export/delete: routes to privacy/records where safe; no deletion is executed.
- Help/legal: existing legal routes where present; support/help placeholders otherwise.
- Sign out: uses existing auth sign-out flow with confirmation.

## Risks

- Profile photo upload is not connected to storage from this control panel.
- Subscription and deletion require verified backend/provider flows before real actions.
- `/profile` remains an existing viewed-profile route area; `/settings` is the active control panel.

## Verification

`npm run typecheck` passed on 2026-06-17. No full build was run.

## Next Recommended Phase

Notification and permission subroute HealthOS visual refinement, because the control panel now links into those older settings detail screens.
