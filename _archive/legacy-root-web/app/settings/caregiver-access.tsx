import { AppHeader, AppScreen, SettingsRow } from "@/components/ui";

export default function CaregiverAccessSettingsScreen() {
  return (
    <AppScreen>
      <AppHeader
        title="Caregiver Access"
        subtitle="Review who can view, log, upload, and use emergency actions."
      />
      <SettingsRow
        label="Granted caregivers"
        subtitle="Caregiver access list and child permissions."
      />
      <SettingsRow
        label="Access defaults"
        subtitle="Default permission sets for future caregiver invites."
      />
    </AppScreen>
  );
}
