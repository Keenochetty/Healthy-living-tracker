import { SettingsDetailScreen } from "@/components/settings/settings-detail-screen";

export default function AppearanceSettingsScreen() {
  return (
    <SettingsDetailScreen
      rows={[
        { icon: "settings", label: "Theme", status: "Device", subtitle: "Device default, light, and dark theme controls." },
        { icon: "home", label: "Dashboard density", subtitle: "Comfortable card spacing and large touch targets." },
        { icon: "ai", label: "Floating AI placement", status: "Safe", subtitle: "Assistant button stays above bottom navigation." }
      ]}
      subtitle="Warm, calm, accessible display preferences."
      title="Appearance"
      toggles={[
        { icon: "activity", label: "Reduce motion", subtitle: "Use calmer transitions when available.", value: false },
        { icon: "settings", label: "Use device theme", subtitle: "Follow the phone theme when available.", value: true }
      ]}
    />
  );
}
