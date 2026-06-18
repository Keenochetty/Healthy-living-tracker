# HealthOS Family / Circle Phase 8

Date: 2026-06-16

## Active Family Route

- Active visible Family tab route found: `src/app/(tabs)/circle.tsx`.
- It now renders `HealthOSFamilyCircleScreen`.
- The route path and visible bottom nav role were preserved.

## Files Created

- `src/components/healthos/family/HealthOSFamilyCircleScreen.tsx`
- `src/components/healthos/family/HealthOSFamilyHero.tsx`
- `src/components/healthos/family/HealthOSFamilyQuickActions.tsx`
- `src/components/healthos/family/HealthOSSharedOverviewWidget.tsx`
- `src/components/healthos/family/HealthOSSharedUpdateRow.tsx`
- `src/components/healthos/family/HealthOSFamilyMemberList.tsx`
- `src/components/healthos/family/HealthOSFamilyMemberCard.tsx`
- `src/components/healthos/family/HealthOSMemberProfileSheet.tsx`
- `src/components/healthos/family/HealthOSMemberNotificationPreview.tsx`
- `src/components/healthos/family/HealthOSSharedEventsWidget.tsx`
- `src/components/healthos/family/HealthOSCaregiverCard.tsx`
- `src/components/healthos/family/HealthOSFamilyInviteManageCard.tsx`
- `src/components/healthos/family/HealthOSFamilyAvatar.tsx`
- `src/components/healthos/family/HealthOSFamilyTypes.ts`
- `src/components/healthos/family/useHealthOSFamilyCircle.ts`
- `src/components/healthos/family/useHealthOSFamilyActions.ts`
- `src/components/healthos/family/index.ts`
- `docs/style-sheets/HEALTHOS_STYLE_SHEET_08_FAMILY_CIRCLE.md`

## Files Updated

- `src/app/(tabs)/circle.tsx`
- `src/components/healthos/index.ts`

## Family Hero

- Implemented a circle-inspired top card with family name, member count/status, privacy chip, avatar stack, shared updates count, and shared events count.
- Empty state says to start a family circle without inventing members.

## Shared Overview

- Implemented `HealthOSSharedOverviewWidget`.
- Uses existing family audit logs only when they are related to family or permissions.
- Shows empty state when no shared updates exist.

## Member List And Profile Sheet

- Implemented member cards with initials, role, status, permission summary, and notification summary.
- Tap opens a modal profile sheet.
- Long press opens `HealthOSGlassMenu` with profile, notifications, shared-with-me, permissions, contact, and disabled remove placeholder.

## Shared Events

- Implemented shared events widget with empty state.
- No fake events are introduced because no safe shared event source was found for this phase.
- Calendar action routes to the existing tab calendar.

## Caregiver Card

- Implemented caregiver card foundation.
- Uses existing caregiver data from `familyPermissionsStorage` when a caregiver exists.
- Shows a compact add caregiver state otherwise.

## Invite / Manage

- Implemented invite/manage card with pending invite count from existing storage.
- Invite/manage/permissions actions route to existing safe routes.
- No invite is sent directly from the hub.

## Permission-Aware Display

- Private health details are not shown.
- Shared modules are derived only from existing `ProfilePermission` records.
- Sensitive modules remain summarized as labels only.
- Missing permission wiring uses empty states/placeholders.

## Data Sources Used

- `getFamilyCircles`
- `getFamilyCircleMembers`
- `getProfilesVisibleToUser`
- `getActiveProfile`
- `getPermissionsForProfile`
- `getCaregiversForCircle`
- `getPendingInvites`
- `getAuditLogsForCircle`

## Routes Connected

- `/(tabs)/circle`
- `/(tabs)/calendar`
- `/caregiver`
- `/caregiver/[caregiverId]`
- `/records`
- `/scan-invite`
- `/settings/privacy-center`
- `/settings/notifications`

## Not Implemented

- No deep Circle/Caregiver/Profile page redesigns.
- No destructive remove member behavior.
- No new invite backend.
- No notification scheduling.
- No fake shared moods or shared events.

## Risks

- The old all-in-one Circle management UI is no longer the first screen; management is routed through existing paths and future deep screens.
- Shared events remain empty until a permission-aware shared event source is connected.
- Notification controls are preview/foundation only.

## Next Recommended Phase

Refine the Circle management deep flow so invite, profile, permission, caregiver, and emergency controls can live behind the new Family hub without crowding the tab.
