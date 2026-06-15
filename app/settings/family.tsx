import { AppHeader, AppScreen, SettingsRow } from "@/components/ui";

export default function FamilySettingsScreen() {
  return (
    <AppScreen>
      <AppHeader
        title="Family Circle"
        subtitle="Circle profile, members, roles, and household setup."
      />
      <SettingsRow
        label="Circle profile"
        subtitle="Name, household details, and shared preferences."
      />
      <SettingsRow
        label="Members"
        subtitle="Parents, guardians, children, partners, dependents, viewers, and caregivers."
      />
    </AppScreen>
  );
}
