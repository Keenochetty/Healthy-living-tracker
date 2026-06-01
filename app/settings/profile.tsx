import { SettingsDetailScreen } from "@/components/settings/settings-detail-screen";

export default function ProfileSettingsScreen() {
  return (
    <SettingsDetailScreen
      rows={[
        { icon: "profiles", label: "Profile details", subtitle: "Full name, display name, and primary role placeholders." },
        { icon: "camera", label: "Avatar", subtitle: "Profile avatar upload will be connected later." },
        { icon: "caregiver", label: "Care role", status: "Profile", subtitle: "Parent, guardian, caregiver, and personal role controls." },
        { icon: "privacy", label: "Profile privacy", status: "Safe", subtitle: "Sensitive information stays out of overview cards." }
      ]}
      subtitle="Manage profile identity, role, display name, and avatar."
      title="Profile"
    />
  );
}
