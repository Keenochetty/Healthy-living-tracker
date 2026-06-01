import { SettingsDetailScreen } from "@/components/settings/settings-detail-screen";

export default function PrivacySharingSettingsScreen() {
  return (
    <SettingsDetailScreen
      rows={[
        { icon: "privacy", label: "Default sharing", subtitle: "Choose what is private, family-shared, or caregiver-shared." },
        { icon: "lock", label: "Sensitive content", subtitle: "Safe previews and security checks for sensitive details." },
        { icon: "emergency", label: "Emergency access", status: "Logged", subtitle: "Emergency access logging preference placeholder." }
      ]}
      subtitle="Control family, partner, caregiver, and emergency visibility."
      title="Privacy & sharing"
      toggles={[
        { icon: "family", label: "Partner sharing", subtitle: "Placeholder for future partner-shared content.", value: false },
        { icon: "caregiver", label: "Caregiver sharing", subtitle: "Allow approved caregiver fields to be shared.", value: true },
        { icon: "privacy", label: "Hide sensitive previews", subtitle: "Keep sensitive details out of cards and notifications.", value: true }
      ]}
    />
  );
}
