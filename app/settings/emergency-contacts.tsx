import { SettingsDetailScreen } from "@/components/settings/settings-detail-screen";

export default function EmergencyContactsSettingsScreen() {
  return (
    <SettingsDetailScreen
      rows={[
        { label: "Primary emergency contact", status: "Needed", subtitle: "Add a default family emergency contact later." },
        { label: "Medical contact", subtitle: "Doctor, clinic, or urgent care contact placeholder." },
        { label: "Caregiver visibility", subtitle: "Control which contacts caregivers can see." }
      ]}
      subtitle="Important contacts for urgent care moments."
      title="Emergency contacts"
    />
  );
}
