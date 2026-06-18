# HealthOS Family Service Implementation

## Location

`src/features/familySharing`

## Created Files

- Types
- Defaults
- Mappers
- Validation
- Permission helpers
- Service methods
- Hooks

## Service Methods

- `getCurrentAuthUser`
- `getFamilyCirclesForCurrentUser`
- `createFamilyCircle`
- `updateFamilyCircle`
- `getFamilyMembers`
- `addFamilyMember`
- `updateFamilyMemberStatus`
- `getFamilyInvites`
- `createFamilyInvite`
- `acceptFamilyInvite`
- `getSharingPermissions`
- `grantSharingPermission`
- `revokeSharingPermission`
- `getCaregiverAssignments`
- `createCaregiverAssignment`
- `updateCaregiverAssignment`

## Status Handling

Services return `missingAuth`, `missingTable`, `ready`, or `error`. Hooks expose honest empty/deferred states and do not fabricate family data.

## Type Status

Generated Supabase types are not available for Batch 3. Row mapping is tolerant until generated types are refreshed.
