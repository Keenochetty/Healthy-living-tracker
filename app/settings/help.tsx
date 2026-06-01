import { SettingsDetailScreen } from "@/components/settings/settings-detail-screen";

export default function HelpSettingsScreen() {
  return (
    <SettingsDetailScreen
      rows={[
        { label: "Getting started", subtitle: "Profile, family, child, caregiver, and notification basics." },
        { label: "Privacy basics", subtitle: "How private, family-shared, caregiver-shared, and emergency-only content works." },
        { label: "Contact support", status: "Later", subtitle: "Support channel placeholder." }
      ]}
      subtitle="Guidance and support placeholders."
      title="Help"
    />
  );
}
