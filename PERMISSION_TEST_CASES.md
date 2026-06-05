# Permission Test Cases

## Profile Switching
- Self profile appears by default.
- Managed child profiles appear only when the viewer can view/manage them.
- Shared adult/elder profiles appear only after explicit access.
- Caregiver contacts do not appear in the health profile switcher.
- Switching profiles refreshes widgets, realm cards, calendar overlays, reminders, and locked states.

## Family Roles
- Partner sees only explicitly shared data.
- Parent/guardian sees child data only where permission allows.
- Teen transition settings reduce parent access according to configured rules.
- Adult child over 18 blocks parent access by default.
- Caregiver sees assigned tasks only.
- Emergency contact sees only emergency-visible information.

## Realm Gates
- Women’s Health, Pregnancy, Baby / Child, Men’s Health, Medication, Supplements, Records, Biometrics, and Device Sync deny unauthorized access.
- Locked cards never include hidden metric values.
- Calendar bottom sheets list only allowed actions.
- Shared data lists use `filterDataByPermission` style boundaries.

## Audit Events
Create audit logs for:
- Permission grant/revoke.
- Invite lifecycle changes.
- Caregiver access changes.
- Emergency info changes.
- Shared record access.
- Medication/supplement schedule edits.
- Dose-log actions.
- Profile transitions.
